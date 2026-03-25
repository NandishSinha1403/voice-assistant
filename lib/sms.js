const twilio = require('twilio');

async function sendSms(toPhone, body) {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    console.warn('[SMS] Twilio env vars missing — skipping SMS');
    return;
  }

  const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  const msg    = await client.messages.create({ from: TWILIO_PHONE_NUMBER, to: toPhone, body });
  console.log(`[SMS] Sent to ${toPhone} — SID: ${msg.sid}`);
  return msg;
}

async function sendTicketSms(toPhone, ticketId, uploadUrl) {
  // If called with OTP body directly (ticketId='OTP', uploadUrl=body string)
  if (ticketId === 'OTP') {
    return sendSms(toPhone, uploadUrl);
  }

  const body =
    `Delhi Municipal Corporation\n` +
    `Your complaint has been successfully registered.\n\n` +
    `Ticket ID: ${ticketId}\n\n` +
    `Upload supporting photos/documents (link valid 48 hours):\n${uploadUrl}`;

  return sendSms(toPhone, body);
}

module.exports = { sendTicketSms };
