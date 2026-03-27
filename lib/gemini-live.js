'use strict';

const { GoogleGenAI } = require('@google/genai');

// Current Gemini Live model — standard Gemini API (ai.google.dev), as of March 2026
const LIVE_MODEL = 'gemini-2.5-flash-native-audio-preview-12-2025';

// ── System prompt ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a helpful AI assistant for the Delhi Municipal Corporation. You help citizens with queries about property tax, water bills, building permits, complaints, and other municipal services. This is a phone call — keep responses clear and spoken naturally.

You are bilingual. Detect whether the caller is speaking Hindi, English, or Hinglish and ALWAYS reply in the exact same language they use. Never switch unless the user does. Keep answers concise for voice.

When collecting phone numbers spoken in Hindi digit words (ek, do, teen, char, paanch, chhe, saat, aath, nau, shunya), convert them to digits before storing.

COMPLAINT TICKET FLOW:
1. Ask for their full name.
2. Ask for their mobile number in any format — accept as spoken, do not ask to reformat.
3. Ask for a clear complaint description.
4. Confirm all three details back to them.
5. Call create_ticket with severity_score (1-10) — only after confirmation.
6. After ticket is created, read the ticket ID digit by digit and tell them an SMS was sent.
7. Ask if they need anything else.

RESPONSE STYLE: Complete sentences only. No markdown, no bullet points. Plain spoken words only.`;

// ── Function declarations ─────────────────────────────────────────────────────
const FUNCTION_DECLARATIONS = [{
  name: 'create_ticket',
  description: "Create a complaint ticket after collecting the citizen's full name, registered mobile number, and complaint description. Only call this AFTER confirming all three details.",
  parameters: {
    type: 'OBJECT',
    properties: {
      name:           { type: 'STRING',  description: 'Full name of the citizen' },
      phone:          { type: 'STRING',  description: 'Registered Indian mobile number' },
      complaint:      { type: 'STRING',  description: 'Full description of the complaint' },
      severity_score: { type: 'INTEGER', description: 'Severity 1-10: 1=minor, 10=life-threatening or major civic breakdown.' },
    },
    required: ['name', 'phone', 'complaint', 'severity_score'],
  },
}];

// ── Audio conversion: Twilio MULAW 8kHz → PCM16 16kHz for Gemini input ────────

function mulawToLinear(byte) {
  const m    = ~byte & 0xFF;
  const sign = m & 0x80;
  const exp  = (m >> 4) & 0x07;
  const mant = m & 0x0F;
  let   s    = ((mant << 3) + 0x84) << exp;
  s -= 0x84;
  return sign ? -s : s;
}

function decodeMulaw(buf) {
  const out = Buffer.alloc(buf.length * 2);
  for (let i = 0; i < buf.length; i++) {
    const s = Math.max(-32768, Math.min(32767, mulawToLinear(buf[i])));
    out.writeInt16LE(s, i * 2);
  }
  return out;
}

function upsample8to16(pcm8) {
  const n   = pcm8.length >> 1;
  const out = Buffer.alloc(n * 4);
  for (let i = 0; i < n; i++) {
    const s0 = pcm8.readInt16LE(i * 2);
    const s1 = i + 1 < n ? pcm8.readInt16LE((i + 1) * 2) : s0;
    out.writeInt16LE(s0, i * 4);
    out.writeInt16LE(Math.round((s0 + s1) / 2), i * 4 + 2);
  }
  return out;
}

// ── Audio conversion: Gemini PCM16 24kHz → MULAW 8kHz for Twilio output ──────

// PCM16 downsample: 24kHz → 8kHz (keep every 3rd sample)
function downsample24to8(pcm24) {
  const inSamples  = pcm24.length >> 1;
  const outSamples = Math.floor(inSamples / 3);
  const out        = Buffer.alloc(outSamples * 2);
  for (let i = 0; i < outSamples; i++) {
    out.writeInt16LE(pcm24.readInt16LE(i * 6), i * 2);
  }
  return out;
}

// PCM16 → MULAW 8-bit
function linearToMulaw(sample) {
  const BIAS = 0x84;
  const MAX  = 32767;
  let sign = 0;
  if (sample < 0) { sign = 0x80; sample = -sample; }
  if (sample > MAX) sample = MAX;
  sample += BIAS;
  let exp = 7;
  for (let exp_mask = 0x4000; (sample & exp_mask) === 0 && exp > 0; exp--, exp_mask >>= 1) {}
  const mantissa = (sample >> (exp + 3)) & 0x0F;
  return ~(sign | (exp << 4) | mantissa) & 0xFF;
}

function encodeMulaw(pcm16) {
  const out = Buffer.alloc(pcm16.length >> 1);
  for (let i = 0; i < out.length; i++) {
    out[i] = linearToMulaw(pcm16.readInt16LE(i * 2));
  }
  return out;
}

// ── GeminiLiveSession ─────────────────────────────────────────────────────────
class GeminiLiveSession {
  /**
   * @param {{
   *   onTranscript:   (text: string, isFinal: boolean) => void,
   *   onAudio:        (mulawBuf: Buffer) => void,
   *   onFunctionCall: (fc: {id: string, name: string, args: object}) => Promise<void>,
   *   onClose:        () => void,
   * }} callbacks
   */
  constructor({ onTranscript, onAudio, onFunctionCall, onClose }) {
    this._ai          = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    this._session     = null;
    this._audioBuf    = Buffer.alloc(0);
    this._flushTimer  = null;
    this._closed      = false;

    this._onTranscript   = onTranscript;
    this._onAudio        = onAudio;
    this._onFunctionCall = onFunctionCall;
    this._onClose        = onClose;
  }

  async connect() {
    this._session = await this._ai.live.connect({
      model: LIVE_MODEL,
      config: {
        // Native audio output — Gemini speaks directly, no external TTS needed
        responseModalities: ['AUDIO'],
        // Transcription of what the caller says
        inputAudioTranscription:  {},
        // Transcription of what Gemini says (for simulation display)
        outputAudioTranscription: {},
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        tools: [{ functionDeclarations: FUNCTION_DECLARATIONS }],
      },
      callbacks: {
        onopen: () => {
          console.log('[Gemini Live] Session open');
        },

        onmessage: (msg) => {
          // ── Caller speech transcription ───────────────────────────────────
          const it = msg.serverContent?.inputTranscription;
          if (it?.text) {
            this._onTranscript(it.text, it.finished === true);
          }

          // ── AI output transcription (for simulation display) ──────────────
          const ot = msg.serverContent?.outputTranscription;
          if (ot?.text && ot.finished) {
            this._onTranscript('__ai__' + ot.text, true);
          }

          // ── Audio response from Gemini → convert to MULAW for Twilio ─────
          const parts = msg.serverContent?.modelTurn?.parts;
          if (parts) {
            for (const part of parts) {
              if (part.inlineData?.mimeType?.startsWith('audio/') && part.inlineData?.data) {
                try {
                  const rawBuf  = Buffer.from(part.inlineData.data, 'base64');
                  // Gemini native audio is PCM16 at 24kHz
                  const pcm8kHz = downsample24to8(rawBuf);
                  const mulaw   = encodeMulaw(pcm8kHz);
                  this._onAudio(mulaw);
                } catch (err) {
                  console.error('[Gemini Live] Audio decode error:', err.message);
                }
              }
            }
          }

          // ── Function call ─────────────────────────────────────────────────
          const fcs = msg.toolCall?.functionCalls;
          if (fcs?.length > 0) {
            const fc = fcs[0];
            this._onFunctionCall({ id: fc.id, name: fc.name, args: fc.args }).catch(err =>
              console.error('[Gemini Live] onFunctionCall error:', err.message)
            );
          }
        },

        onerror: (err) => {
          console.error('[Gemini Live] Error type=%s msg=%s', err?.type, err?.message, err);
        },

        onclose: (event) => {
          console.log('[Gemini Live] Session closed — code:%s reason:%s',
            event?.code, event?.reason);
          if (!this._closed) {
            this._closed = true;
            this._onClose();
          }
        },
      },
    });
  }

  sendAudio(mulawBuf) {
    if (!this._session || this._closed) return;
    this._audioBuf = Buffer.concat([this._audioBuf, mulawBuf]);

    // Flush every 40ms worth of audio (8000 Hz × 0.04 s = 320 bytes)
    // Small batches keep input latency low while avoiding per-packet overhead
    if (this._audioBuf.length >= 320) {
      this._flush();
      return;
    }

    clearTimeout(this._flushTimer);
    this._flushTimer = setTimeout(() => this._flush(), 40);
  }

  _flush() {
    clearTimeout(this._flushTimer);
    this._flushTimer = null;
    if (this._audioBuf.length === 0 || !this._session || this._closed) {
      this._audioBuf = Buffer.alloc(0);
      return;
    }

    const pcm8  = decodeMulaw(this._audioBuf);
    const pcm16 = upsample8to16(pcm8);
    const b64   = pcm16.toString('base64');
    this._audioBuf = Buffer.alloc(0);

    try {
      this._session.sendRealtimeInput({
        audio: { mimeType: 'audio/pcm;rate=16000', data: b64 },
      });
    } catch (err) {
      console.error('[Gemini Live] sendRealtimeInput error:', err.message);
    }
  }

  async sendToolResponse(id, name, result) {
    if (!this._session || this._closed) return;
    try {
      this._session.sendToolResponse({
        functionResponses: [{ id, name, response: result }],
      });
    } catch (err) {
      console.error('[Gemini Live] sendToolResponse error:', err.message);
    }
  }

  close() {
    this._closed = true;
    clearTimeout(this._flushTimer);
    this._audioBuf = Buffer.alloc(0);
    if (this._session) {
      try { this._session.close(); } catch (_) {}
      this._session = null;
    }
  }
}

module.exports = { GeminiLiveSession };
