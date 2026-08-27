/**
 * Dynamic QR Code Token Generator & Verifier
 * Token changes every interval (default 8 seconds)
 */

// Simple hashing function for rotating tokens in Next.js edge/node
export function generateDynamicToken(sessionId: string, timestamp: number = Date.now(), intervalSeconds: number = 8): { token: string; expiresAt: number; timeRemainingSec: number } {
  const windowIndex = Math.floor(timestamp / (intervalSeconds * 1000));
  const seed = `${sessionId}:${windowIndex}:MY_STUDENT_ROOM_SECURE_SALT_2026`;
  
  // Calculate simple 8-char hex hash
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0').toUpperCase();
  const token = `MSR-${hex.slice(0, 4)}-${hex.slice(4, 8)}`;
  const expiresAt = (windowIndex + 1) * intervalSeconds * 1000;
  const timeRemainingSec = Math.max(1, Math.ceil((expiresAt - timestamp) / 1000));

  return { token, expiresAt, timeRemainingSec };
}

/**
 * Validate incoming scanned token against current and immediately previous window (to tolerate 1-window network delay)
 */
export function verifyDynamicToken(sessionId: string, token: string, intervalSeconds: number = 8): boolean {
  if (!token || !sessionId) return false;
  const now = Date.now();
  
  // Check current window
  const current = generateDynamicToken(sessionId, now, intervalSeconds);
  if (current.token.toLowerCase() === token.toLowerCase()) return true;

  // Check previous window (tolerance for network transit)
  const previous = generateDynamicToken(sessionId, now - (intervalSeconds * 1000), intervalSeconds);
  if (previous.token.toLowerCase() === token.toLowerCase()) return true;

  return false;
}
