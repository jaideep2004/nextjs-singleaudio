import crypto from 'crypto';
import tls from 'tls';

const OTP_TTL_MINUTES = Number(process.env.OTP_TTL_MINUTES || 10);

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

  const body = `Your OTP for SIngle Audio Login Is ${otp}. It is valid for 10 minutes. Do not share this OTP.`;
  const url = new URL(baseUrl);
  url.searchParams.set('key', apiKey);
  url.searchParams.set('from', process.env.AMAZE_SMS_SENDER_ID || 'SNGLAU');
  url.searchParams.set('to', phoneNumber);
  url.searchParams.set('body', body);
  url.searchParams.set('templateid', process.env.AMAZE_SMS_TEMPLATE_ID || '1007380632079936419');
  url.searchParams.set('entityid', process.env.AMAZE_SMS_ENTITY_ID || '1001529360956910382');

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Amaze SMS failed with status ${response.status}`);
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

export async function sendEmailMessage(email: string, subject: string, text: string): Promise<void> {
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

  const message = [
    `From: Single Audio <${user}>`,
    `To: ${email}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=utf-8',
    '',
    text,
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
    'Your Single Audio OTP',
    `Your OTP for Single Audio is ${otp}. It is valid for ${OTP_TTL_MINUTES} minutes. Do not share this OTP.`
  );
}
