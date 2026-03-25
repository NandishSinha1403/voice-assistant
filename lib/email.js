const nodemailer = require('nodemailer');

let _transporter = null;

function getTransporter() {
  if (!_transporter) {
    const { EMAIL_USER, EMAIL_PASS } = process.env;
    if (!EMAIL_USER || !EMAIL_PASS) throw new Error('Missing EMAIL_USER / EMAIL_PASS in .env');
    _transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    });
  }
  return _transporter;
}

async function sendOtpEmail(toEmail, otp) {
  const transporter = getTransporter();
  await transporter.sendMail({
    from:    `"DMC Portal" <${process.env.EMAIL_USER}>`,
    to:      toEmail,
    subject: `Your DMC Admin OTP: ${otp}`,
    text:    `Your one-time password for Delhi Municipal Corporation admin portal is:\n\n${otp}\n\nValid for 5 minutes. Do not share this with anyone.`,
    html:    `
      <div style="font-family:sans-serif;max-width:420px;margin:0 auto;padding:24px;background:#0d1117;color:#e6edf3;border-radius:12px">
        <h2 style="color:#388bfd;margin-bottom:8px">🏛️ Delhi Municipal Corporation</h2>
        <p style="color:#8b949e;margin-bottom:24px">Admin Portal Login</p>
        <div style="background:#161b22;border:1px solid #30363d;border-radius:10px;padding:24px;text-align:center;margin-bottom:24px">
          <p style="color:#8b949e;font-size:13px;margin-bottom:12px">Your one-time password</p>
          <div style="font-size:36px;font-weight:700;letter-spacing:10px;color:#388bfd">${otp}</div>
          <p style="color:#8b949e;font-size:12px;margin-top:12px">Valid for 5 minutes</p>
        </div>
        <p style="color:#8b949e;font-size:12px">If you did not request this, ignore this email.</p>
      </div>`,
  });
  console.log(`[EMAIL] OTP sent to ${toEmail}`);
}

module.exports = { sendOtpEmail };
