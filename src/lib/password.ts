import { randomBytes, scrypt as _scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(_scrypt);
const KEYLEN = 64;

/** Hash a password: returns "salt:hash" (hex). */
export async function hashPassword(plain: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derived = (await scrypt(plain, salt, KEYLEN)) as Buffer;
  return `${salt}:${derived.toString('hex')}`;
}

/** Constant-time verify against a stored "salt:hash". */
export async function verifyPassword(plain: string, stored: string | null): Promise<boolean> {
  if (!stored || !stored.includes(':')) return false;
  const [salt, hash] = stored.split(':');
  const expected = Buffer.from(hash, 'hex');
  const derived = (await scrypt(plain, salt, KEYLEN)) as Buffer;
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}

export function passwordProblem(plain: string): string | null {
  if (plain.length < 8) return 'Password must be at least 8 characters.';
  if (plain.length > 200) return 'Password is too long.';
  return null;
}
