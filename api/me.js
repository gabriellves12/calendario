/** GET /api/me — devolve a sessão atual (ou 401). Útil para "manter logado". */
import { requireAuth } from './_lib/auth.js';

export default async function handler(req, res) {
  const session = requireAuth(req, res);
  if (!session) return;
  return res.status(200).json({ user: session.user, role: session.role });
}
