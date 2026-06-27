/**
 * GET /api/instagram/status
 * Diz se há uma conta Instagram conectada (sem expor o token).
 */
import { requireAuth } from '../_lib/auth.js';
import { getItem, KEYS } from '../_lib/store.js';

export default async function handler(req, res) {
  if (!requireAuth(req, res)) return;

  const acc = await getItem(KEYS.igAccount);
  if (!acc) return res.status(200).json({ connected: false });

  return res.status(200).json({
    connected: true,
    username: acc.username,
    igUserId: acc.igUserId,
    connectedAt: acc.connectedAt,
  });
}
