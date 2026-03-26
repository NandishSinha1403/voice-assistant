import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import EventSource from 'react-native-sse';
import { endCall, getTranscriptStreamUrl, startCall } from '../api/client';
import { colors } from '../theme';

function StatusIndicator({ active, status }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!active) return;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 800, useNativeDriver: false }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: false }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [active, pulseAnim]);

  const dotColor = status.includes('Ringing') ? colors.amber
    : status.includes('connected') ? colors.green
    : status.includes('ended') ? colors.red
    : colors.textDim;

  return (
    <View style={styles.statusRow}>
      <Animated.View style={[styles.statusDot, { backgroundColor: dotColor, transform: [{ scale: active ? pulseAnim : 1 }] }]} />
      <Text style={[styles.statusText, { color: dotColor }]}>{status}</Text>
    </View>
  );
}

export function CallScreen() {
  const [phone, setPhone] = useState('+918509047388');
  const [status, setStatus] = useState('Enter a number and tap Call');
  const [callSid, setCallSid] = useState('');
  const [active, setActive] = useState(false);
  const [events, setEvents] = useState([]);
  const [duration, setDuration] = useState(0);
  const streamRef = useRef(null);
  const flatListRef = useRef(null);
  const durationRef = useRef(null);

  // Duration timer
  useEffect(() => {
    if (!active) return;
    durationRef.current = setInterval(() => setDuration(prev => prev + 1), 1000);
    return () => { if (durationRef.current) clearInterval(durationRef.current); };
  }, [active]);

  // SSE transcript stream
  useEffect(() => {
    const stream = new EventSource(getTranscriptStreamUrl());
    streamRef.current = stream;

    stream.addEventListener('message', (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'connected') return;
        if (payload.type === 'call_started') {
          setStatus('Call connected');
          if (payload.callSid) setCallSid(payload.callSid);
          setActive(true);
          setDuration(0);
        }
        if (payload.type === 'call_ended') {
          setStatus('Call ended');
          setActive(false);
          setCallSid('');
          if (durationRef.current) clearInterval(durationRef.current);
        }
        if (payload.type === 'user' || payload.type === 'ai') {
          setEvents(prev => [
            { id: `${Date.now()}-${Math.random()}`, type: payload.type, text: payload.text || '' },
            ...prev,
          ]);
        }
      } catch {}
    });

    stream.addEventListener('error', () => setStatus('Reconnecting…'));

    return () => {
      if (stream) stream.close();
      if (durationRef.current) clearInterval(durationRef.current);
    };
  }, []);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  async function onStart() {
    if (!phone.trim()) { setStatus('Enter phone number first'); return; }
    setStatus('Placing call…');
    try {
      const data = await startCall(phone.trim());
      setCallSid(data.callSid || '');
      setStatus('Ringing…');
      setActive(Boolean(data.callSid));
    } catch (err) {
      setStatus(err.message || 'Call failed');
    }
  }

  async function onEnd() {
    if (!callSid) return;
    setStatus('Ending call…');
    try {
      await endCall(callSid);
      setActive(false);
      setCallSid('');
      setStatus('Call ended');
    } catch (err) {
      setStatus(err.message || 'Failed to end call');
    }
  }

  return (
    <View style={styles.container}>
      {/* Call Controls */}
      <View style={styles.controlsCard}>
        <View style={styles.accentBar} />

        <Text style={styles.inputLabel}>Phone Number</Text>
        <TextInput
          style={styles.phoneInput}
          value={phone}
          onChangeText={setPhone}
          placeholder="+91 98765 43210"
          placeholderTextColor={colors.textDim}
          editable={!active}
          keyboardType="phone-pad"
          maxLength={15}
        />

        <View style={styles.btnRow}>
          <Pressable
            style={[styles.callBtn, styles.startBtn, active && styles.btnDisabled]}
            onPress={onStart}
            disabled={active}
          >
            <Text style={styles.callBtnText}>📞 Call Now</Text>
          </Pressable>
          <Pressable
            style={[styles.callBtn, styles.endBtn, !active && styles.btnDisabled]}
            onPress={onEnd}
            disabled={!active}
          >
            <Text style={styles.callBtnText}>📵 End Call</Text>
          </Pressable>
        </View>

        <StatusIndicator active={active} status={status} />

        {active && (
          <Text style={styles.duration}>⏱ {fmt(duration)}</Text>
        )}
      </View>

      {/* Transcript */}
      <View style={styles.transcriptSection}>
        <View style={styles.transcriptHeader}>
          <View style={[styles.liveDot, active && styles.liveDotActive]} />
          <Text style={styles.transcriptTitle}>LIVE TRANSCRIPT</Text>
          <Text style={styles.transcriptCount}>{events.length}</Text>
        </View>

        <FlatList
          ref={flatListRef}
          data={events}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.transcriptList}
          renderItem={({ item }) => (
            <View style={[styles.msgBubble, item.type === 'user' ? styles.userBubble : styles.aiBubble]}>
              <Text style={styles.msgRole}>
                {item.type === 'user' ? '🎤 Caller' : '🤖 AI'}
              </Text>
              <Text style={styles.msgText}>{item.text}</Text>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyTranscript}>
              <Text style={styles.emptyText}>
                {active ? 'Waiting for conversation…' : 'Transcript will appear here'}
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  // Controls card
  controlsCard: {
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    padding: 20,
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 3,
    backgroundColor: colors.blue,
  },
  inputLabel: { fontSize: 12, color: colors.textDim, fontWeight: '600', marginBottom: 6, letterSpacing: 0.3 },
  phoneInput: {
    backgroundColor: colors.bg,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    color: colors.text,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 14,
  },
  btnRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  callBtn: {
    flex: 1, paddingVertical: 14,
    borderRadius: 10, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  startBtn: { backgroundColor: 'rgba(34,197,94,0.1)', borderColor: colors.green },
  endBtn: { backgroundColor: 'rgba(239,68,68,0.1)', borderColor: colors.red },
  callBtnText: { color: colors.text, fontWeight: '700', fontSize: 14 },
  btnDisabled: { opacity: 0.35 },

  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 13, fontWeight: '600' },
  duration: { color: colors.blue3, fontSize: 14, fontWeight: '700', textAlign: 'center', marginTop: 8, letterSpacing: 0.5 },

  // Transcript
  transcriptSection: { flex: 1 },
  transcriptHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomColor: colors.border, borderBottomWidth: 1,
  },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.textDim },
  liveDotActive: { backgroundColor: colors.green },
  transcriptTitle: { flex: 1, fontSize: 11, fontWeight: '700', color: colors.textDim, letterSpacing: 1.5 },
  transcriptCount: { fontSize: 12, color: colors.textDim, fontWeight: '600' },

  transcriptList: { padding: 12, gap: 8 },
  msgBubble: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, maxWidth: '85%' },
  userBubble: {
    backgroundColor: 'rgba(37,99,235,0.1)',
    borderColor: 'rgba(37,99,235,0.2)',
    alignSelf: 'flex-end',
  },
  aiBubble: {
    backgroundColor: 'rgba(168,85,247,0.08)',
    borderColor: 'rgba(168,85,247,0.2)',
    alignSelf: 'flex-start',
  },
  msgRole: { color: colors.blue3, fontSize: 10, fontWeight: '700', marginBottom: 3, letterSpacing: 0.5 },
  msgText: { color: colors.text, fontSize: 13, lineHeight: 19 },

  emptyTranscript: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { color: colors.textDim, fontSize: 14 },
});
