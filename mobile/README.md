# React Native Mobile App

This folder contains a React Native (Expo) client that reuses your existing backend endpoints without changing backend logic.

## Features

- Chat screen -> `POST /api/chat`
- Call screen -> `POST /api/call`, `POST /api/call/end`
- Live transcripts -> `GET /api/transcripts` (SSE)

## Setup

1. Install backend dependencies in the repo root and run your server:

```bash
npm install
npm run dev
```

2. Configure mobile base URL in your shell:

```bash
# Android emulator default for host machine localhost
set EXPO_PUBLIC_BASE_URL=http://10.0.2.2:3000

# iOS simulator usually works with localhost
# set EXPO_PUBLIC_BASE_URL=http://localhost:3000

# Physical device: use LAN IP or ngrok https URL
# set EXPO_PUBLIC_BASE_URL=https://<your-ngrok-url>
```

3. Run the mobile app:

```bash
cd mobile
npm install
npm start
```

Then press `a` for Android emulator or scan QR with Expo Go.

## Notes

- The app keeps your existing API contract as-is.
- `.env` remains ignored in git at repo root.
