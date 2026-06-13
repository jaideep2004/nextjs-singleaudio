import tls from 'tls';
import { Db } from 'mongodb';

type Recipient = {
  email?: string;
  name?: string;
};

type ActionEmail = {
  subject: string;
  title: string;
  intro: string;
  details?: Record<string, string | number | undefined | null>;
  actionLabel?: string;
  actionUrl?: string;
};

const getFrontendUrl = () => (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
const getLogoUrl = () => `${getFrontendUrl()}/images/singleaudio-b1.png`;

const escapeHtml = (value: unknown) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const readSmtpResponse = (socket: tls.TLSSocket): Promise<string> =>
  new Promise((resolve, reject) => {
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

const smtpCommand = async (socket: tls.TLSSocket, command: string) => {
  socket.write(`${command}\r\n`);
  const response = await readSmtpResponse(socket);
  if (!/^(2|3)\d{2}/.test(response)) {
    throw new Error(`SMTP command failed: ${response.trim()}`);
  }
};

const renderDetails = (details?: ActionEmail['details']) => {
  const rows = Object.entries(details || {}).filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '');
  if (!rows.length) return '';

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;border-collapse:separate;border-spacing:0;border:1px solid #eadde8;border-radius:16px;overflow:hidden;background:#ffffff">
      ${rows.map(([label, value]) => `
        <tr>
          <td style="padding:14px 16px;background:#fbf7fb;color:#7d6f7b;font:700 12px Arial,sans-serif;text-transform:uppercase;letter-spacing:.04em;width:38%;border-bottom:1px solid #f0e6ee">${escapeHtml(label)}</td>
          <td style="padding:14px 16px;color:#171018;font:700 14px Arial,sans-serif;border-bottom:1px solid #f0e6ee">${escapeHtml(value)}</td>
        </tr>
      `).join('')}
    </table>
  `;
};

const renderHtml = ({ title, intro, details, actionLabel, actionUrl }: ActionEmail) => `
  <!doctype html>
  <html>
    <body style="margin:0;padding:0;background:#05050a;color:#171018">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#05050a;padding:28px 12px">
        <tr>
          <td align="center">
            <table role="presentation" width="680" cellpadding="0" cellspacing="0" style="width:100%;max-width:680px;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #1f1326;box-shadow:0 28px 70px rgba(0,0,0,.32)">
              <tr>
                <td style="padding:34px 40px;background:radial-gradient(ellipse 80% 50% at 80% 20%, rgba(123,31,162,0.30) 0%, transparent 60%),radial-gradient(ellipse 60% 40% at 10% 80%, rgba(237,30,121,0.20) 0%, transparent 60%),#05050a;color:#ffffff;border-bottom:1px solid rgba(255,255,255,.08)">
                  <img src="${escapeHtml(getLogoUrl())}" alt="SingleAudio Distribution" width="228" style="display:block;max-width:228px;height:auto;margin:0" />
                </td>
              </tr>
              <tr>
                <td style="padding:38px 40px 30px">
                  <h1 style="margin:0 0 14px;color:#171018;font:900 30px/1.15 Arial,sans-serif;letter-spacing:-.01em">${escapeHtml(title)}</h1>
                  <p style="margin:0;color:#4d4350;font:500 16px/1.65 Arial,sans-serif">${escapeHtml(intro)}</p>
                  ${renderDetails(details)}
                  ${actionLabel && actionUrl ? `<a href="${escapeHtml(actionUrl)}" style="display:inline-block;margin-top:28px;padding:14px 22px;border-radius:14px;background:linear-gradient(135deg,#ed1e79,#7b1fa2);color:#ffffff;text-decoration:none;font:900 14px Arial,sans-serif;box-shadow:0 14px 26px rgba(237,30,121,.22)">${escapeHtml(actionLabel)}</a>` : ''}
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

const renderText = ({ title, intro, details, actionLabel, actionUrl }: ActionEmail) => [
  title,
  '',
  intro,
  '',
  ...Object.entries(details || {})
    .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '')
    .map(([label, value]) => `${label}: ${value}`),
  actionLabel && actionUrl ? `${actionLabel}: ${actionUrl}` : '',
].filter(Boolean).join('\n');

const sendOne = async (recipient: string, email: ActionEmail) => {
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
  await smtpCommand(socket, `RCPT TO:<${recipient}>`);
  await smtpCommand(socket, 'DATA');

  const message = [
    `From: SingleAudio Distribution <${user}>`,
    `To: ${recipient}`,
    `Subject: ${email.subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    '',
    renderHtml(email) || renderText(email),
    '.',
  ].join('\r\n');
  socket.write(`${message}\r\n`);
  await readSmtpResponse(socket);
  socket.write('QUIT\r\n');
  socket.end();
};

const uniqueRecipients = (recipients: Recipient[]) =>
  Array.from(new Set(recipients.map((recipient) => recipient.email?.trim().toLowerCase()).filter(Boolean))) as string[];

const buildNotificationMessage = ({ title, intro }: ActionEmail) => {
  const message = [title, intro].map((value) => value.trim()).filter(Boolean).join(': ');
  return message.length > 240 ? `${message.slice(0, 237)}…` : message;
};

const createEmailNotifications = async (db: Db, recipients: string[], email: ActionEmail) => {
  try {
    if (!recipients.length) return;

    const users = await db.collection('users').find(
      { email: { $in: recipients }, isActive: { $ne: false } },
      { projection: { _id: 1 } }
    ).toArray();

    if (!users.length) return;

    const now = new Date();
    const message = buildNotificationMessage(email);
    await db.collection('notifications').insertMany(
      users.map((user) => ({
        userId: user._id,
        message,
        type: 'email',
        isRead: false,
        createdAt: now,
        updatedAt: now,
      }))
    );
  } catch (error) {
    console.warn('SingleAudio Distribution email notification skipped:', error);
  }
};

export const getAdminRecipients = async (db: Db): Promise<Recipient[]> => {
  const admins = await db.collection('users').find(
    { role: 'admin', isActive: { $ne: false } },
    { projection: { name: 1, email: 1 } }
  ).toArray();
  return admins.map((admin) => ({ name: String(admin.name || ''), email: String(admin.email || '') }));
};

export const sendActionEmail = async (recipients: Recipient[], email: ActionEmail, db?: Db) => {
  const to = uniqueRecipients(recipients);
  if (!to.length) return;

  const results = await Promise.allSettled(to.map((recipient) => sendOne(recipient, email)));
  results.forEach((result) => {
    if (result.status === 'rejected') console.warn('SingleAudio Distribution email skipped:', result.reason);
  });

  if (db) await createEmailNotifications(db, to, email);
};

export const sendUserAndAdminEmail = async (db: Db, user: Recipient, email: ActionEmail) => {
  const admins = await getAdminRecipients(db);
  await sendActionEmail([user, ...admins], email, db);
};

export const appUrl = (path: string) => `${getFrontendUrl()}${path.startsWith('/') ? path : `/${path}`}`;
