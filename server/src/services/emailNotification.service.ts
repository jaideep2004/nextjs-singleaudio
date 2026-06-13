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
const getLogoUrl = () => `${getFrontendUrl()}/images/singleaudio-b1.png`;

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

const renderEmail = ({ title, intro, details, actionLabel, actionUrl }: ActionEmail) => `
  <!doctype html>
  <html>
    <body style="margin:0;padding:0;background:#05050a;color:#171018">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:transparent;padding:28px 12px">
        <tr>
          <td align="center">
            <table role="presentation" width="680" cellpadding="0" cellspacing="0" style="width:100%;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #1f1326;box-shadow:0 28px 70px rgba(0,0,0,.32)">
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
                  ${actionLabel && actionUrl ? `
                    <a href="${escapeHtml(actionUrl)}" style="display:inline-block;margin-top:28px;padding:14px 22px;border-radius:14px;background:linear-gradient(135deg,#ed1e79,#7b1fa2);color:#ffffff;text-decoration:none;font:900 14px Arial,sans-serif;box-shadow:0 14px 26px rgba(237,30,121,.22)">${escapeHtml(actionLabel)}</a>
                  ` : ''}
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
    console.warn('SingleAudio Distribution email notification skipped:', error);
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
      console.warn('SingleAudio Distribution email skipped:', result.reason);
    }
  });

  await createEmailNotifications(to, email);
};

export const sendUserAndAdminEmail = async (user: MailRecipient, email: ActionEmail): Promise<void> => {
  const admins = await getAdminEmailRecipients();
  await sendActionEmail([user, ...admins], email);
};

export const buildDashboardUrl = (path: string) => `${getFrontendUrl()}${path.startsWith('/') ? path : `/${path}`}`;
