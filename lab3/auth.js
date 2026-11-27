import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const credentials = new Map();
const sessions = new Map();
const ttl = 8 * 60 * 60 * 1000;

function validPassword(value) {
  return typeof value === 'string' && value.length >= 3 && value.length <= 128;
}

export function setPassword(id, password) {
  if (!validPassword(password)) return false;
  const salt = randomBytes(16);
  credentials.set(id, { salt, hash: scryptSync(password, salt, 32) });
  return true;
}

export function checkPassword(id, password) {
  const credential = credentials.get(id);
  return Boolean(credential && validPassword(password) &&
    timingSafeEqual(credential.hash, scryptSync(password, credential.salt, 32)));
}

export function createSession(id) {
  const now = Date.now();
  for (const [token, session] of sessions) {
    if (session.expires <= now) sessions.delete(token);
  }
  if (sessions.size >= 1000) return null;
  const token = randomBytes(32).toString('hex');
  sessions.set(token, { id, expires: now + ttl });
  return token;
}

function bearer(req) {
  return /^Bearer ([a-f0-9]{64})$/.exec(req.get('authorization') || '')?.[1];
}

export function requireOwner(req, res, next) {
  const session = sessions.get(bearer(req));
  if (!session || session.expires <= Date.now()) {
    return res.status(401).json({ error: 'Войдите в свой аккаунт' });
  }
  if (session.id !== Number(req.params.userId)) {
    return res.status(403).json({ error: 'Недостаточно прав' });
  }
  next();
}

export function revokeSession(req) {
  sessions.delete(bearer(req));
}
