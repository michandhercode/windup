/**
 * Windup email templates (pure functions: data in, { subject, html, text } out).
 * Layout is table-based with inline styles because that is what Gmail, Outlook and Apple Mail render reliably.
 * Server-side only; nothing here touches the network.
 */

export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

interface Layout {
  /** Short line some inboxes show next to the subject. */
  preheader: string;
  heading: string;
  paragraphs: string[];
  button?: { label: string; url: string };
  /** A one-time code, shown large (used when there is no link). */
  code?: string;
  /** Small print under the button. */
  note?: string;
}

const COLORS = {
  page: '#fff7ed',
  card: '#ffffff',
  brand: '#e11d48',
  brandDark: '#be123c',
  text: '#1e293b',
  muted: '#64748b',
  border: '#fde7d3',
};

const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

/** Escapes text before it goes into HTML. Every value that is not a literal in this file goes through this. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderHtml(layout: Layout): string {
  const paragraphs = layout.paragraphs
    .map(
      (p) =>
        `<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:${COLORS.text};">${escapeHtml(p)}</p>`
    )
    .join('');

  const code = layout.code
    ? `<div style="margin:8px 0 20px;padding:14px 18px;background:${COLORS.page};border:1px solid ${COLORS.border};border-radius:12px;text-align:center;font-size:28px;font-weight:700;letter-spacing:6px;color:${COLORS.brandDark};font-family:'Courier New',Courier,monospace;">${escapeHtml(layout.code)}</div>`
    : '';

  const button = layout.button
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 20px;"><tr><td align="center" bgcolor="${COLORS.brand}" style="border-radius:12px;"><a href="${escapeHtml(layout.button.url)}" target="_blank" style="display:inline-block;padding:13px 28px;font-family:${FONT};font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:12px;">${escapeHtml(layout.button.label)}</a></td></tr></table>
<p style="margin:0 0 16px;font-size:12px;line-height:1.6;color:${COLORS.muted};">Button not working? Copy and paste this link into your browser:<br><a href="${escapeHtml(layout.button.url)}" target="_blank" style="color:${COLORS.brandDark};word-break:break-all;">${escapeHtml(layout.button.url)}</a></p>`
    : '';

  const note = layout.note
    ? `<p style="margin:0;font-size:13px;line-height:1.6;color:${COLORS.muted};">${escapeHtml(layout.note)}</p>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${escapeHtml(layout.heading)}</title>
</head>
<body style="margin:0;padding:0;background:${COLORS.page};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(layout.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${COLORS.page};">
<tr><td align="center" style="padding:32px 16px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:${COLORS.card};border:1px solid ${COLORS.border};border-radius:20px;overflow:hidden;">
    <tr><td align="center" bgcolor="${COLORS.brand}" style="padding:26px 24px;background:${COLORS.brand};">
      <div style="font-family:${FONT};font-size:26px;font-weight:700;letter-spacing:-0.5px;color:#ffffff;">&#9992;&#65039; Windup</div>
      <div style="font-family:${FONT};font-size:12px;margin-top:4px;color:#ffe4e6;letter-spacing:1px;text-transform:uppercase;">Fold memories &middot; Release paper planes</div>
    </td></tr>
    <tr><td style="padding:32px 32px 28px;font-family:${FONT};">
      <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:${COLORS.text};">${escapeHtml(layout.heading)}</h1>
      ${paragraphs}
      ${code}
      ${button}
      ${note}
    </td></tr>
  </table>
  <p style="max-width:560px;margin:16px auto 0;font-family:${FONT};font-size:12px;line-height:1.6;color:${COLORS.muted};text-align:center;">You are receiving this email because of activity on your Windup account.</p>
</td></tr>
</table>
</body>
</html>`;
}

function renderText(layout: Layout): string {
  const parts = [layout.heading, '', ...layout.paragraphs.flatMap((p) => [p, ''])];
  if (layout.code) parts.push(`Your code: ${layout.code}`, '');
  if (layout.button) parts.push(`${layout.button.label}: ${layout.button.url}`, '');
  if (layout.note) parts.push(layout.note, '');
  parts.push('— Windup');
  return parts.join('\n');
}

function build(subject: string, layout: Layout): EmailContent {
  return { subject, html: renderHtml(layout), text: renderText(layout) };
}

const greeting = (name?: string | null) => (name?.trim() ? `, ${name.trim()}` : '');

/** Sent when someone signs up. Replaces Supabase's plain default confirmation email. */
export function signupConfirmationEmail(input: { name?: string | null; confirmUrl: string }): EmailContent {
  return build('Confirm your Windup account', {
    preheader: 'One tap to finish creating your Windup account.',
    heading: `Welcome to Windup${greeting(input.name)}`,
    paragraphs: [
      'Thank you for joining. Confirm your email address to finish creating your account, a quiet place to fold your memories and release paper planes.',
    ],
    button: { label: 'Confirm my email', url: input.confirmUrl },
    note: 'If you did not create a Windup account, you can safely ignore this email. For your security, the link expires after a short time.',
  });
}

export type AuthEmailType =
  | 'signup'
  | 'invite'
  | 'magiclink'
  | 'email'
  | 'recovery'
  | 'email_change'
  | 'reauthentication';

/** Every other email Supabase Auth can send. Needed because the Send Email hook takes over ALL of them. */
export function authEmail(input: {
  type: string;
  name?: string | null;
  actionUrl?: string;
  code?: string;
}): EmailContent {
  const ignoreNote = 'If you did not request this, you can safely ignore this email. For your security, it expires after a short time.';

  switch (input.type) {
    case 'signup':
      return signupConfirmationEmail({ name: input.name, confirmUrl: input.actionUrl ?? '' });
    case 'invite':
      return build('You have been invited to Windup', {
        preheader: 'Accept your invitation to Windup.',
        heading: `You are invited${greeting(input.name)}`,
        paragraphs: ['You have been invited to join Windup. Accept the invitation to set up your account.'],
        button: input.actionUrl ? { label: 'Accept invitation', url: input.actionUrl } : undefined,
        note: ignoreNote,
      });
    case 'magiclink':
    case 'email':
      return build('Your Windup sign-in link', {
        preheader: 'Use this link to sign in to Windup.',
        heading: `Sign in to Windup${greeting(input.name)}`,
        paragraphs: ['Use the button below to sign in. No password needed.'],
        button: input.actionUrl ? { label: 'Sign in', url: input.actionUrl } : undefined,
        code: input.code,
        note: ignoreNote,
      });
    case 'recovery':
      return build('Reset your Windup password', {
        preheader: 'Choose a new password for your Windup account.',
        heading: `Reset your password${greeting(input.name)}`,
        paragraphs: ['We received a request to reset the password for your Windup account.'],
        button: input.actionUrl ? { label: 'Choose a new password', url: input.actionUrl } : undefined,
        note: ignoreNote,
      });
    case 'email_change':
      return build('Confirm your new email address', {
        preheader: 'Confirm the new email address for your Windup account.',
        heading: `Confirm your new email${greeting(input.name)}`,
        paragraphs: ['Confirm this address to finish changing the email on your Windup account.'],
        button: input.actionUrl ? { label: 'Confirm new email', url: input.actionUrl } : undefined,
        note: ignoreNote,
      });
    case 'reauthentication':
      return build('Your Windup verification code', {
        preheader: 'Your one-time verification code.',
        heading: `Confirm it is you${greeting(input.name)}`,
        paragraphs: ['Enter this code to confirm the change you are making to your account.'],
        code: input.code,
        note: ignoreNote,
      });
    default:
      return build('Confirm your request on Windup', {
        preheader: 'Please confirm your request.',
        heading: `Please confirm${greeting(input.name)}`,
        paragraphs: ['Use the button below to confirm your request.'],
        button: input.actionUrl ? { label: 'Confirm', url: input.actionUrl } : undefined,
        code: input.code,
        note: ignoreNote,
      });
  }
}

/**
 * Sent when a sealed letter's date has arrived. A reminder and a link only: the letter's contents are never
 * put in an email (see docs/4_API_ROUTES.md, section 12).
 */
export function sealedLetterUnlockedEmail(input: {
  name?: string | null;
  letterTitle?: string | null;
  openUrl: string;
}): EmailContent {
  const title = input.letterTitle?.trim();
  return build('Your sealed Windup letter is ready to open', {
    preheader: 'The wait is over: a letter you sealed can now be opened.',
    heading: `A letter from your past self is ready${greeting(input.name)}`,
    paragraphs: [
      title
        ? `The letter you sealed, “${title}”, can now be opened.`
        : 'A letter you sealed can now be opened.',
      'Open your Jar to read it. For your privacy, the contents of your letters are never sent by email.',
    ],
    button: { label: 'Open my Jar', url: input.openUrl },
    note: 'You are getting this because you chose to seal a letter in Windup until today.',
  });
}