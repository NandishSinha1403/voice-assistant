const os = require('os');
const { spawn } = require('child_process');

function isPrivateIpv4(ip) {
  if (!ip || typeof ip !== 'string') return false;
  if (ip.startsWith('10.')) return true;
  if (ip.startsWith('192.168.')) return true;
  const parts = ip.split('.').map(Number);
  return parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31;
}

function pickLanIp() {
  const nets = os.networkInterfaces();
  const candidates = [];

  for (const name of Object.keys(nets)) {
    for (const iface of nets[name] || []) {
      if (iface.family !== 'IPv4' || iface.internal) continue;
      if (!isPrivateIpv4(iface.address)) continue;
      candidates.push(iface.address);
    }
  }

  if (candidates.length === 0) return null;

  // Prefer common Wi-Fi/LAN ranges first.
  const preferred = candidates.find((ip) => ip.startsWith('192.168.'));
  return preferred || candidates[0];
}

const ip = pickLanIp();
if (!ip) {
  console.error('No private LAN IPv4 address found. Connect to Wi-Fi/LAN and retry.');
  process.exit(1);
}

console.log(`Using LAN host: ${ip}`);

const child = spawn('npx expo start --host lan --clear', {
  shell: true,
  stdio: 'inherit',
  env: {
    ...process.env,
    REACT_NATIVE_PACKAGER_HOSTNAME: ip,
    EXPO_DEVTOOLS_LISTEN_ADDRESS: '0.0.0.0',
  },
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
