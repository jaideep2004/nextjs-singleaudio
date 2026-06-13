import crypto from 'crypto';
import tls from 'tls';

const OTP_TTL_MINUTES = Number(process.env.OTP_TTL_MINUTES || 10);
const AMAZE_SMS_TIMEOUT_MS = Number(process.env.AMAZE_SMS_TIMEOUT_MS || 45000);

export const getOtpExpiry = () => new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

export const generateOtp = () => crypto.randomInt(100000, 999999).toString();

export const hashOtp = (otp: string) =>
  crypto.createHash('sha256').update(`${otp}:${process.env.JWT_SECRET || 'otp-secret'}`).digest('hex');

export const verifyOtpHash = (otp: string, hash: string) => hashOtp(otp) === hash;

export async function sendAmazeSmsOtp(phoneNumber: string, otp: string): Promise<void> {
  const baseUrl = process.env.AMAZE_SMS_BASE_URL || 'https://api.amazesms.com/api/sms';
  const apiKey = process.env.AMAZE_SMS_API_KEY;
  if (!apiKey) {
    console.warn('AMAZE_SMS_API_KEY missing; SMS OTP skipped');
    return;
  }

  const body = `Your OTP for SingleAudio Login is ${otp}. It is valid for ${OTP_TTL_MINUTES} minutes. Do not share this OTP.`;
  const url = new URL(baseUrl);
  url.searchParams.set('key', apiKey);
  url.searchParams.set('from', process.env.AMAZE_SMS_SENDER_ID || 'SNGLAU');
  url.searchParams.set('to', phoneNumber);
  url.searchParams.set('body', body);
  url.searchParams.set('templateid', process.env.AMAZE_SMS_TEMPLATE_ID || '1007380632079936419');
  url.searchParams.set('entityid', process.env.AMAZE_SMS_ENTITY_ID || '1001529360956910382');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AMAZE_SMS_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Amaze SMS failed with status ${response.status}`);
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Amaze SMS timed out after ${AMAZE_SMS_TIMEOUT_MS}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function readSmtpResponse(socket: tls.TLSSocket): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: string[] = [];
    const onData = (chunk: Buffer) => {
      chunks.push(chunk.toString('utf8'));
      const text = chunks.join('');
      const lines = text.trim().split(/\r?\n/);
      const last = lines[lines.length - 1] || '';
      if (/^\d{3}\s/.test(last)) {
        socket.off('data', onData);
        resolve(text);
      }
    };
    socket.on('data', onData);
    socket.once('error', reject);
  });
}

async function smtpCommand(socket: tls.TLSSocket, command: string) {
  socket.write(`${command}\r\n`);
  const response = await readSmtpResponse(socket);
  if (!/^(2|3)\d{2}/.test(response)) {
    throw new Error(`SMTP command failed: ${response.trim()}`);
  }
}

const escapeHtml = (value: unknown) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const getFrontendUrl = () => (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');

function renderBasicEmail(subject: string, text: string) {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => `<p style="margin:0 0 14px;color:#4d4350;font:500 16px/1.65 Arial,sans-serif">${escapeHtml(part).replace(/\n/g, '<br />')}</p>`)
    .join('');

  return `
    <!doctype html>
    <html>
      <body style="margin:0;padding:0;background:#05050a;color:#171018">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#05050a;padding:28px 12px">
          <tr>
            <td align="center">
              <table role="presentation" width="680" cellpadding="0" cellspacing="0" style="width:100%;max-width:680px;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #1f1326;box-shadow:0 28px 70px rgba(0,0,0,.32)">
                <tr>
                  <td style="padding:34px 40px;background:radial-gradient(ellipse 80% 50% at 80% 20%, rgba(123,31,162,0.30) 0%, transparent 60%),radial-gradient(ellipse 60% 40% at 10% 80%, rgba(237,30,121,0.20) 0%, transparent 60%),#05050a;color:#ffffff;border-bottom:1px solid rgba(255,255,255,.08)">
                    <img src="${escapeHtml(`${getFrontendUrl()}/images/singleaudio-b1.png`)}" alt="SingleAudio Distribution" width="228" style="display:block;max-width:228px;height:auto;margin:0" />
                  </td>
                </tr>
                <tr>
                  <td style="padding:38px 40px 30px">
                    <h1 style="margin:0 0 14px;color:#171018;font:900 30px/1.15 Arial,sans-serif;letter-spacing:-.01em">${escapeHtml(subject)}</h1>
                    ${paragraphs}
                    <p style="margin:32px 0 0;padding-top:18px;border-top:1px solid #f0e6ee;color:#8d808c;font:500 12px/1.6 Arial,sans-serif">Automated notification from SingleAudio Distribution.</p>
                    <p style="margin:6px 0 0;color:#aaa0aa;font:400 11px/1.5 Arial,sans-serif">© ${new Date().getFullYear()} SingleAudio Distribution. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

export async function sendEmailMessage(email: string, subject: string, text: string, html?: string): Promise<void> {
  const user = process.env.SMTP_GMAIL_USER;
  const pass = process.env.SMTP_GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    console.warn('SMTP Gmail env missing; email skipped');
    return;
  }

  const socket = tls.connect(465, 'smtp.gmail.com');
  await new Promise<void>((resolve, reject) => {
    socket.once('secureConnect', resolve);
    socket.once('error', reject);
  });

  await readSmtpResponse(socket);
  await smtpCommand(socket, 'EHLO singleaudio.local');
  await smtpCommand(socket, 'AUTH LOGIN');
  await smtpCommand(socket, Buffer.from(user).toString('base64'));
  await smtpCommand(socket, Buffer.from(pass).toString('base64'));
  await smtpCommand(socket, `MAIL FROM:<${user}>`);
  await smtpCommand(socket, `RCPT TO:<${email}>`);
  await smtpCommand(socket, 'DATA');

  const bodyHtml = html || renderBasicEmail(subject, text);
  const message = [
    `From: SingleAudio Distribution <${user}>`,
    `To: ${email}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    '',
    bodyHtml,
    '.',
  ].join('\r\n');
  socket.write(`${message}\r\n`);
  await readSmtpResponse(socket);
  socket.write('QUIT\r\n');
  socket.end();
}

export async function sendEmailOtp(email: string, otp: string): Promise<void> {
  return sendEmailMessage(
    email,
    'Your SingleAudio Distribution OTP',
    `Your OTP for SingleAudio Distribution is ${otp}. It is valid for ${OTP_TTL_MINUTES} minutes. Do not share this OTP.`
  );
}
