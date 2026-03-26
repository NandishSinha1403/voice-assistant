import { API_BASE_URL } from '../config';

function toUrl(path) {
  return `${API_BASE_URL}${path}`;
}

async function parseJsonSafe(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { error: text || 'Invalid server response' };
  }
}

// ── Auth ─────────────────────────────────────────────────────────

export async function sendOtp(identifier, type = 'citizen') {
  const res = await fetch(toUrl('/api/auth/send-otp'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, type }),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
  return data;
}

export async function verifyOtp(identifier, otp, type = 'citizen') {
  const res = await fetch(toUrl('/api/auth/verify-otp'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, otp, type }),
    credentials: 'include',
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) throw new Error(data.error || 'Invalid OTP');
  return data;
}

export async function getMe() {
  const res = await fetch(toUrl('/api/auth/me'), { credentials: 'include' });
  if (!res.ok) return null;
  return parseJsonSafe(res);
}

export async function logout() {
  await fetch(toUrl('/api/auth/logout'), { method: 'POST', credentials: 'include' });
}

// ── Tickets ──────────────────────────────────────────────────────

export async function getMyTickets() {
  const res = await fetch(toUrl('/api/my-tickets'), { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load tickets');
  return parseJsonSafe(res);
}

export async function createTicket(name, complaint) {
  const res = await fetch(toUrl('/api/tickets'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, complaint }),
    credentials: 'include',
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) throw new Error(data.error || 'Failed to create ticket');
  return data;
}

// ── Call ──────────────────────────────────────────────────────────

export async function startCall(to) {
  const res = await fetch(toUrl('/api/call'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to }),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) throw new Error(data.error || 'Call failed');
  return data;
}

export async function endCall(callSid) {
  const res = await fetch(toUrl('/api/call/end'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callSid }),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) throw new Error(data.error || 'Failed to end call');
  return data;
}

export function getTranscriptStreamUrl() {
  return toUrl('/api/transcripts');
}
