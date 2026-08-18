import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Generates a cryptographically secure opaque token (64-char hex string).
 */
export function generateOpaqueToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hashes a token using SHA-256 for secure DB storage (verification tokens, reset tokens).
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Hashes a user password using bcryptjs.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compares a plaintext password with a stored bcrypt hash.
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
