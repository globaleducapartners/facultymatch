import { createHash, randomBytes } from "crypto";

const TOKEN_BYTES = 32; // 64 hex chars
const TOKEN_EXPIRY_HOURS = 24;
const RESEND_COOLDOWN_SECONDS = 60;

/**
 * Generate a cryptographically secure random token and return both
 * the plaintext token (to embed in the URL) and the SHA-256 hash (to store).
 */
export function generateToken(): { token: string; hash: string } {
  const token = randomBytes(TOKEN_BYTES).toString("hex");
  const hash = createHash("sha256").update(token).digest("hex");
  return { token, hash };
}

/**
 * Hash a plaintext token for lookup.
 */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Compute the expiry timestamp (ISO string) for a new token.
 */
export function getTokenExpiry(): string {
  const date = new Date();
  date.setHours(date.getHours() + TOKEN_EXPIRY_HOURS);
  return date.toISOString();
}

/**
 * Check if a token has expired.
 */
export function isTokenExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() < Date.now();
}

export { TOKEN_EXPIRY_HOURS, RESEND_COOLDOWN_SECONDS };