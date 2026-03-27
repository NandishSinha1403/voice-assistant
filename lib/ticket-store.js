const crypto  = require('crypto');
const tickets = new Map();
const tokens  = new Map(); // token → ticketId

const TOKEN_TTL_MS = 48 * 60 * 60 * 1000; // 48 hours

// Daily counter: { date: 'YYYYMMDD', count: N }
let counter = { date: '', count: 0 };

function todayStr() {
  return new Date().toISOString().slice(0, 10).replace(/-/g, '');
}

function nextId() {
  const today = todayStr();
  if (counter.date !== today) {
    counter.date  = today;
    counter.count = 0;
  }
  counter.count++;
  return `DMC-${today}-${String(counter.count).padStart(4, '0')}`;
}

function normalizePhone(phone) {
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 10) return '+91' + digits;
  if (digits.length === 11 && digits.startsWith('0')) return '+91' + digits.slice(1);
  if (digits.length === 12 && digits.startsWith('91')) return '+' + digits;
  if (digits.length === 13 && digits.startsWith('091')) return '+' + digits.slice(1);
  // Try to extract last 10 digits if longer (e.g. user said "91 8509047388")
  if (digits.length > 10) return '+91' + digits.slice(-10);
  return phone;
}

function normalizeWords(text) {
  return String(text).toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
}

function jaccardSimilarity(setA, setB) {
  const a = new Set(setA);
  const b = new Set(setB);
  let intersection = 0;
  for (const w of a) { if (b.has(w)) intersection++; }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function countSimilarOpen(complaintText) {
  const words = normalizeWords(complaintText);
  const normalized = words.join(' ');
  let count = 0;
  for (const t of tickets.values()) {
    if (t.status !== 'open') continue;
    const tWords = normalizeWords(t.complaint);
    const tNormalized = tWords.join(' ');
    const isSubstring = normalized.includes(tNormalized) || tNormalized.includes(normalized);
    if (isSubstring || jaccardSimilarity(words, tWords) >= 0.6) {
      count++;
    }
  }
  return count;
}

function createTicket(name, phone, complaint, severityScore) {
  const id    = nextId();
  const token = crypto.randomBytes(24).toString('hex'); // 48-char URL-safe token
  const expiry = new Date(Date.now() + TOKEN_TTL_MS).toISOString();

  const rawScore = Math.max(1, Math.min(10, Math.round(Number(severityScore) || 5)));
  const similarCount = countSimilarOpen(complaint);
  const finalScore = Math.min(10, rawScore + similarCount);

  const ticket = {
    id,
    name:        name.trim(),
    phone:       normalizePhone(phone),
    complaint:   complaint.trim(),
    severityScore: finalScore,
    status:      'open',
    createdAt:   new Date().toISOString(),
    uploadToken: token,
    uploadExpiry: expiry,
    files:       [],
  };

  tickets.set(id, ticket);
  tokens.set(token, id);
  console.log(`[TICKET] Created ${id} — severity ${finalScore} (base=${rawScore}, similar=${similarCount}) — token expires ${expiry}`);
  return ticket;
}

function getTicket(id) {
  return tickets.get(id) || null;
}

// Resolve token → ticket, checking expiry
function getTicketByToken(token) {
  const id = tokens.get(token);
  if (!id) return { ticket: null, error: 'invalid' };
  const ticket = tickets.get(id);
  if (!ticket) return { ticket: null, error: 'invalid' };
  if (Date.now() > new Date(ticket.uploadExpiry).getTime()) {
    return { ticket: null, error: 'expired' };
  }
  return { ticket, error: null };
}

function addFile(ticketId, fileMetadata) {
  const ticket = tickets.get(ticketId);
  if (ticket) ticket.files.push(fileMetadata);
}

function getAllTickets() {
  return Array.from(tickets.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

module.exports = { createTicket, getTicket, getTicketByToken, addFile, getAllTickets };
