import { createHash, randomBytes } from 'node:crypto';
import { prisma } from './prisma';
import { sendEmail } from './email';

const TOKEN_TTL_MIN = 20;

function hash(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

function appUrl() {
  return (process.env.APP_URL ?? 'http://localhost:3001').replace(/\/+$/, '');
}

/**
 * Issue a magic link for an existing user. Accounts are admin-provisioned, so
 * we do NOT reveal whether the email exists — the caller always shows the same
 * "check your email" message.
 */
export async function issueMagicLink(rawEmail: string): Promise<void> {
  const email = rawEmail.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.active) return; // silently no-op

  const token = randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + TOKEN_TTL_MIN * 60 * 1000);

  await prisma.loginToken.create({
    data: { identifier: email, tokenHash: hash(token), expires },
  });

  const url = `${appUrl()}/api/auth/verify?token=${token}&email=${encodeURIComponent(email)}`;

  await sendEmail({
    to: email,
    subject: 'Your Summertech sign-in link',
    text: `Hi${user.name ? ' ' + user.name : ''},\n\nClick to sign in to the Summertech LMS (valid for ${TOKEN_TTL_MIN} minutes):\n\n${url}\n\nIf you didn't request this, you can ignore this email.`,
  });
}

/** Verify a token; returns the user id on success, or null. Consumes the token. */
export async function consumeMagicLink(rawEmail: string, token: string): Promise<string | null> {
  const email = rawEmail.trim().toLowerCase();
  const record = await prisma.loginToken.findUnique({ where: { tokenHash: hash(token) } });

  if (
    !record ||
    record.identifier !== email ||
    record.usedAt !== null ||
    record.expires.getTime() < Date.now()
  ) {
    return null;
  }

  const target = await prisma.user.findUnique({ where: { email } });
  if (!target || !target.active) return null;

  await prisma.loginToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  const user = await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date() },
  });

  // Best-effort cleanup of expired/used tokens for this email.
  await prisma.loginToken
    .deleteMany({ where: { identifier: email, OR: [{ usedAt: { not: null } }, { expires: { lt: new Date() } }] } })
    .catch(() => {});

  return user.id;
}
