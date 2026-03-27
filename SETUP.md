# DMC Jarvis AI Voice Agent — Setup Guide

## Prerequisites

- **Node.js** v18+ — [nodejs.org](https://nodejs.org/)
- **ngrok** CLI (for Twilio webhook tunneling) — [ngrok.com/download](https://ngrok.com/download)
- **Expo CLI** (for the mobile app) — installed automatically via `npx`
- **Expo Go** app on your phone (Android/iOS) — for testing the mobile app

### External Accounts

| Service | Required For | Sign Up |
|---------|-------------|---------|
| Twilio | Voice calls + SMS | [twilio.com](https://www.twilio.com/) |
| Google Cloud | Speech-to-Text + Text-to-Speech | [cloud.google.com](https://cloud.google.com/) |
| Google Gemini | AI chat/reasoning | [ai.google.dev](https://ai.google.dev/) |
| Gmail (App Password) | Admin OTP emails | [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) |

---

## 1. Clone & Install Dependencies

```bash
# Install backend dependencies
npm install

# Install mobile app dependencies
cd mobile
npm install
cd ..
```

---

## 2. Configure Environment Variables

Copy the example file and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` with the following values:

```env
PORT=3000

# ── Twilio ────────────────────────────────────────────
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx

# ── Google Cloud (Speech-to-Text / Text-to-Speech) ───
# Option A: path to service account JSON file
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
# Option B: inline JSON string (for cloud hosting)
# GOOGLE_CREDENTIALS_JSON={"type":"service_account",...}

# ── Gemini AI ─────────────────────────────────────────
GEMINI_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ── Public URL (set automatically by tunnel.js) ──────
# Only set manually if you're deploying to a server
# BASE_URL=https://your-domain.com

# ── Admin Login (email OTP) ──────────────────────────
ADMIN_EMAILS=admin@example.com,admin2@example.com
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=xxxx-xxxx-xxxx-xxxx   # Gmail App Password, NOT your regular password
```

### Google Credentials Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project (or select existing)
3. Enable **Cloud Speech-to-Text API** and **Cloud Text-to-Speech API**
4. Create a Service Account → download the JSON key file
5. Save it as `google-credentials.json` in the project root

---

## 3. Start the Backend Server

### Option A: Development mode (auto-restart on file changes)

```bash
npm run dev
```

### Option B: Production mode

```bash
npm start
```

The server starts on `http://localhost:3000` with these pages:

| URL | Description |
|-----|-------------|
| `http://localhost:3000/` | Main dashboard |
| `http://localhost:3000/simulation` | Voice call simulation (browser mic) |
| `http://localhost:3000/jarvis` | Jarvis chat interface |
| `http://localhost:3000/login` | Login page (citizen / admin) |
| `http://localhost:3000/my-tickets` | Citizen ticket list |
| `http://localhost:3000/tickets` | Admin ticket dashboard (requires login) |

---

## 4. Expose Server via ngrok (for Twilio)

Twilio needs a public HTTPS URL to send incoming calls to your local server.

### Automatic (recommended)

```bash
npm run tunnel
```

This command:
1. Starts an ngrok tunnel
2. Auto-configures the Twilio voice webhook
3. Starts the backend server
4. Prints the public URL

### Manual

```bash
# Terminal 1: start the server
npm start

# Terminal 2: start ngrok
ngrok http 3000
```

Then manually set your Twilio phone number's Voice webhook to:
```
https://<your-ngrok-id>.ngrok-free.app/api/voice
```

---

## 5. Start the Mobile App

The mobile app is an Expo (React Native) app in the `mobile/` directory.

### Set the backend URL

The app auto-detects the backend URL based on platform:
- **Android emulator**: `http://10.0.2.2:3000`
- **iOS simulator**: `http://localhost:3000`
- **Physical device**: Set the env variable before starting:

```bash
# Replace with your computer's LAN IP (e.g., 192.168.1.5)
set EXPO_PUBLIC_BASE_URL=http://192.168.1.5:3000
```

Or if using ngrok:
```bash
set EXPO_PUBLIC_BASE_URL=https://xxxx.ngrok-free.app
```

### Start Expo dev server

```bash
npm run mobile:start
```

This auto-detects your LAN IP and starts Expo on your network.

### Run on specific platforms

```bash
# Android (emulator or connected device)
npm run mobile:android

# iOS (macOS only)
npm run mobile:ios

# Web browser
npm run mobile:web
```

### Connect from phone

1. Open **Expo Go** on your phone
2. Scan the QR code shown in the terminal
3. Make sure your phone and computer are on the **same Wi-Fi network**

---

## Quick Start (TL;DR)

```bash
# 1. Install
npm install && cd mobile && npm install && cd ..

# 2. Configure
cp .env.example .env
# Edit .env with your Twilio, Google, and Gemini credentials

# 3. Run backend + tunnel (one command)
npm run tunnel

# 4. Run mobile app (new terminal)
npm run mobile:start
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transcripts` | SSE live transcript feed |
| POST | `/api/chat` | Browser chat (text in, text + audio out) |
| POST | `/api/call` | Initiate outbound voice call |
| POST | `/api/call/end` | End an active call |
| POST | `/api/voice` | Twilio voice webhook (TwiML) |
| WS | `/api/stream` | WebSocket for real-time voice relay |
| POST | `/api/auth/send-otp` | Send login OTP (SMS or email) |
| POST | `/api/auth/verify-otp` | Verify OTP and create session |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Current user info |
| GET | `/api/tickets` | All tickets (admin only) |
| GET | `/api/my-tickets` | Citizen's own tickets |
| POST | `/api/tickets` | Create a ticket (citizen) |
| PATCH | `/api/admin/ticket/:id/status` | Update ticket status (admin) |
| GET | `/api/ticket/:id` | Get ticket by ID |
| GET | `/api/upload/:token` | Get ticket info via upload token |
| POST | `/api/upload/:token` | Upload files to a ticket |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `Missing TWILIO_ACCOUNT_SID` | Check your `.env` file has valid Twilio credentials |
| `Missing EMAIL_USER / EMAIL_PASS` | Add Gmail credentials for admin OTP emails |
| ngrok not found | Install ngrok CLI: `npm install -g ngrok` or download from ngrok.com |
| Mobile app can't connect | Ensure phone and computer are on the same Wi-Fi; set `EXPO_PUBLIC_BASE_URL` |
| Google STT/TTS errors | Verify `google-credentials.json` exists and APIs are enabled in Google Cloud |
| Port 3000 in use | Change `PORT` in `.env` or stop the other process |
