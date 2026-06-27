/**
 * POST /api/login   { user, pass }
 * Valida as credenciais do time e cria um cookie de sessão httpOnly.
 * Esta é a versão "de servidor" do login — substitui a checagem no cliente
 * quando o app passar a usar o backend.
 */
import { createSession, setSessionCookie } from './_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'método não permitido' });
  }

  const { user, pass } = req.body || {};
  const U = process.env.TEAM_USER || 'nevel2026';
  const P = process.env.TEAM_PASS || 'marketing';

  if (user === U && pass === P) {
    const token = createSession({ user, role: 'marketing' });
    setSessionCookie(res, token);
    return res.status(200).json({ ok: true, user });
  }
  return res.status(401).json({ error: 'usuário ou senha incorretos' });
}
