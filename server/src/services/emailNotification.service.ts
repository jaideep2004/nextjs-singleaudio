import User from '../repositories/user.repository';
import { NotificationType, UserRole } from '../config/constants';
import { sendEmailMessage } from './otp.service';
import { createNotification } from './notification.service';

type MailRecipient = {
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

const escapeHtml = (value: unknown) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const getFrontendUrl = () => (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');

const renderDetails = (details?: ActionEmail['details']) => {
  const rows = Object.entries(details || {}).filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '');
  if (!rows.length) return '';

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;border-collapse:collapse;border:1px solid #d9e2ef;border-radius:12px;overflow:hidden">
      ${rows.map(([label, value]) => `
        <tr>
          <td style="padding:12px 14px;background:#f8fafc;color:#64748b;font:700 12px Arial,sans-serif;text-transform:uppercase;letter-spacing:.04em;width:38%">${escapeHtml(label)}</td>
          <td style="padding:12px 14px;color:#0f172a;font:700 14px Arial,sans-serif">${escapeHtml(value)}</td>
        </tr>
      `).join('')}
    </table>
  `;
};

const renderEmail = ({ title, intro, details, actionLabel, actionUrl }: ActionEmail) => `
  <!doctype html>
  <html>
    <body style="margin:0;padding:0;background:#eef3f8;color:#0f172a">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef3f8;padding:28px 12px">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border:1px solid #d9e2ef;border-radius:18px;overflow:hidden;box-shadow:0 18px 48px rgba(15,23,42,.10)">
              <tr>
                <td style="padding:28px 30px;background:#08111f;color:#ffffff">
                  <div style="font:900 22px Arial,sans-serif;letter-spacing:.08em">SINGLEAUDIO</div>
                  <div style="margin-top:6px;color:#94a3b8;font:700 12px Arial,sans-serif;text-transform:uppercase;letter-spacing:.18em">Distribution</div>
                </td>
              </tr>
              <tr>
                <td style="padding:30px">
                  <h1 style="margin:0 0 12px;color:#0f172a;font:900 28px/1.15 Arial,sans-serif">${escapeHtml(title)}</h1>
                  <p style="margin:0;color:#475569;font:500 16px/1.55 Arial,sans-serif">${escapeHtml(intro)}</p>
                  ${renderDetails(details)}
                  ${actionLabel && actionUrl ? `
                    <a href="${escapeHtml(actionUrl)}" style="display:inline-block;margin-top:24px;padding:12px 18px;border-radius:10px;background:#4a6cf7;color:#ffffff;text-decoration:none;font:900 14px Arial,sans-serif">${escapeHtml(actionLabel)}</a>
                  ` : ''}
                  <p style="margin:26px 0 0;color:#94a3b8;font:500 12px/1.5 Arial,sans-serif">This is an automated Single Audio notification.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
`;

const textFromEmail = ({ title, intro, details, actionLabel, actionUrl }: ActionEmail) => [
  title,
  '',
  intro,
  '',
  ...Object.entries(details || {})
    .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '')
    .map(([label, value]) => `${label}: ${value}`),
  actionLabel && actionUrl ? `${actionLabel}: ${actionUrl}` : '',
].filter(Boolean).join('\n');

const uniqueRecipients = (recipients: MailRecipient[]) =>
  Array.from(
    new Map(
      recipients
        .map((recipient) => ({ ...recipient, email: recipient.email?.trim().toLowerCase() }))
        .filter((recipient): recipient is Required<MailRecipient> => Boolean(recipient.email))
        .map((recipient) => [recipient.email, recipient])
    ).values()
  );

const buildNotificationMessage = ({ title, intro }: ActionEmail) => {
  const message = [title, intro].map((value) => value.trim()).filter(Boolean).join(': ');
  return message.length > 240 ? `${message.slice(0, 237)}…` : message;
};

const createEmailNotifications = async (recipients: MailRecipient[], email: ActionEmail) => {
  try {
    const emails = recipients.map((recipient) => recipient.email).filter(Boolean);
    if (!emails.length) return;

    const users = await User.find({ email: { $in: emails }, isActive: { $ne: false } }).select('_id').lean();
    const message = buildNotificationMessage(email);

    await Promise.all(
      users.map((user) => createNotification(user._id, message, NotificationType.EMAIL))
    );
  } catch (error) {
    console.warn('Single Audio email notification skipped:', error);
  }
};

export const getAdminEmailRecipients = async (): Promise<MailRecipient[]> => {
  const admins = await User.find({ role: UserRole.ADMIN, isActive: { $ne: false } }).select('name email').lean();
  return admins.map((admin) => ({ name: admin.name, email: admin.email }));
};

export const sendActionEmail = async (recipients: MailRecipient[], email: ActionEmail): Promise<void> => {
  const to = uniqueRecipients(recipients);
  if (!to.length) return;

  const html = renderEmail(email);
  const text = textFromEmail(email);
  const results = await Promise.allSettled(
    to.map((recipient) => sendEmailMessage(recipient.email, email.subject, text, html))
  );

  results.forEach((result) => {
    if (result.status === 'rejected') {
      console.warn('Single Audio email skipped:', result.reason);
    }
  });

  await createEmailNotifications(to, email);
};

export const sendUserAndAdminEmail = async (user: MailRecipient, email: ActionEmail): Promise<void> => {
  const admins = await getAdminEmailRecipients();
  await sendActionEmail([user, ...admins], email);
};

export const buildDashboardUrl = (path: string) => `${getFrontendUrl()}${path.startsWith('/') ? path : `/${path}`}`;
