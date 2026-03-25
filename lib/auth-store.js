const crypto = require('crypto');

// OTPs: Map<identifier, { otp, expiresAt, type }>
const otps     = new Map();
// Sessions: Map<token, { id, role, createdAt }>
const sessions = new Map();

const OTP_TTL_MS     = 5  * 60 * 1000;  // 5 minutes
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6-digit
}

function createOtp(identifier) {
  const otp = generateOtp();
  otps.set(identifier, { otp, expiresAt: Date.now() + OTP_TTL_MS });
  return otp;
}

function verifyOtp(identifier, inputOtp) {
  const record = otps.get(identifier);
  if (!record) return { ok: false, reason: 'No OTP found. Please request a new one.' };
  if (Date.now() > record.expiresAt) {
    otps.delete(identifier);
    return { ok: false, reason: 'OTP expired. Please request a new one.' };
  }
  if (record.otp !== String(inputOtp).trim()) {
    return { ok: false, reason: 'Incorrect OTP.' };
  }
  otps.delete(identifier);
  return { ok: true };
}

function createSession(id, role) {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, { id, role, createdAt: Date.now() });
  return token;
}

function getSession(token) {
  if (!token) return null;
  const s = sessions.get(token);
  if (!s) return null;
  if (Date.now() - s.createdAt > SESSION_TTL_MS) {
    sessions.delete(token);
    return null;
  }
  return s;
}

function deleteSession(token) {
  sessions.delete(token);
}

// Parse session token from Cookie header
function parseSessionCookie(cookieHeader) {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:^|;\s*)session=([a-f0-9]+)/);
  return match ? match[1] : null;
}

module.exports = { createOtp, verifyOtp, createSession, getSession, deleteSession, parseSessionCookie };
