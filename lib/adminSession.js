import crypto from 'crypto';
import { cookies } from 'next/headers';

// In-memory session store — valid for single-instance Railway deployment.
// Sessions are lost on restart (acceptable; admins just log in again).
// globalThis keeps the Map alive across HMR reloads in dev.
const sessions = globalThis.__adminSessions ?? (globalThis.__adminSessions = new Map()); // tokenHash -> expiresAt (ms)
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function pruneExpired() {
  const now = Date.now();
  for (const [k, exp] of sessions) if (exp < now) sessions.delete(k);
}

export function createAdminSession() {
  const token = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  pruneExpired();
  sessions.set(hash, Date.now() + SESSION_TTL_MS);
  return token;
}

export function destroyAdminSession(token) {
  if (!token) return;
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  sessions.delete(hash);
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  if (!token) return false;
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const expiry = sessions.get(hash);
  return !!(expiry && expiry > Date.now());
}

export async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    throw new Error('Unauthorized');
  }
}
