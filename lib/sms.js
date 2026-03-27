'use strict';

const twilio = require('twilio');

function getClient() {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) return null;
  return twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
}

async function sendSms(toPhone, body) {
  const client = getClient();
  if (!client) {
    console.warn('[SMS] Twilio env vars missing — skipping SMS');
    return;
  }
  const { TWILIO_PHONE_NUMBER } = process.env;
  if (!TWILIO_PHONE_NUMBER) {
    console.warn('[SMS] TWILIO_PHONE_NUMBER missing — skipping SMS');
    return;
  }
  const msg = await client.messages.create({ from: TWILIO_PHONE_NUMBER, to: toPhone, body });
  console.log(`[SMS] Sent to ${toPhone} — SID: ${msg.sid}`);
  return msg;
}

// ── OTP via SMS (Twilio) ──────────────────────────────────────────────────────
async function sendOtpSms(toPhone, otp) {
  const body =
    `Delhi Municipal Corporation\n` +
    `Your OTP is: ${otp}\n` +
    `Valid for 5 minutes. Do not share this with anyone.`;
  return sendSms(toPhone, body);
}

// ── Ticket confirmation with upload link ─────────────────────────────────────
async function sendTicketSms(toPhone, ticketId, uploadUrl) {
  const body =
    `Delhi Municipal Corporation\n` +
    `Complaint registered successfully.\n\n` +
    `Ticket ID: ${ticketId}\n\n` +
    `Upload photos/documents (valid 48 hrs):\n${uploadUrl}`;
  return sendSms(toPhone, body);
}

module.exports = { sendOtpSms, sendTicketSms };
