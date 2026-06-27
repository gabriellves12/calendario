/**
 * Sessão simples baseada em token assinado (HMAC-SHA256).
 * Sem dependências externas. Formato:  base64url(payload).base64url(assinatura)
 */
import crypto from 'node:crypto';

const SECRET = process.env.SESSION_SECRET || 'dev-secret-troque-isto';
const MAX_AGE_MS = 1000 * 60 * 60 * 12; // 12h

const b64url = (buf) =>
  Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromB64url = (s) =>
  Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString();

function sign(data) {
  return b64url(crypto.createHmac('sha256', SECRET).update(data).digest());
}

export function createSession(payload) {
  const body = b64url(JSON.stringify({ ...payload, iat: Date.now() }));
  return `${body}.${sign(body)}`;
}

export function verifySession(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  // comparação em tempo constante
  const expected = sign(body);
  if (sig.length !== expected.length ||
      !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const data = JSON.parse(fromB64url(body));
    if (!data.iat || Date.now() - data.iat > MAX_AGE_MS) return null;
    return data;
  } catch {
    return null;
  }
}

/* Lê o cookie de sessão do request */
export function readSessionCookie(req) {
  const raw = req.headers.cookie || '';
  const match = raw.split(';').map((c) => c.trim()).find((c) => c.startsWith('nevel_session='));
  return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : null;
}

/* Define o cookie de sessão httpOnly */
export function setSessionCookie(res, token) {
  res.setHeader('Set-Cookie',
    `nevel_session=${encodeURIComponent(token)}; HttpOnly; Path=/; Max-Age=${MAX_AGE_MS / 1000}; SameSite=Lax; Secure`);
}
export function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', 'nevel_session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax; Secure');
}

/* Guard para rotas protegidas — retorna a sessão ou responde 401 */
export function requireAuth(req, res) {
  const session = verifySession(readSessionCookie(req));
  if (!session) {
    res.status(401).json({ error: 'não autenticado' });
    return null;
  }
  return session;
}
