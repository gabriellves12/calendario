/**
 * GET /api/instagram/metrics
 * Devolve métricas da conta + posts recentes com insights.
 * É o que vai alimentar a Tela 2 (Métricas) no lugar dos dados de demonstração.
 */
import { requireAuth } from '../_lib/auth.js';
import { getItem, KEYS } from '../_lib/store.js';
import { accountInsights, recentMediaWithInsights } from '../_lib/ig.js';

export default async function handler(req, res) {
  if (!requireAuth(req, res)) return;

  const acc = await getItem(KEYS.igAccount);
  if (!acc) return res.status(409).json({ error: 'Instagram não conectado.' });

  try {
    const [account, media] = await Promise.all([
      accountInsights(acc.igUserId, acc.accessToken),
      recentMediaWithInsights(acc.igUserId, acc.accessToken, 10),
    ]);

    // normaliza para o formato que o frontend consome
    const rows = media.map((m) => ({
      id: m.id,
      name: (m.caption || '').split('\n')[0].slice(0, 60) || m.media_type,
      type: (m.media_type || '').toLowerCase(),
      permalink: m.permalink,
      reach: m.insights.reach ?? null,
      likes: m.like_count ?? null,
      comments: m.comments_count ?? null,
      shares: m.insights.shares ?? null,
      saves: m.insights.saved ?? null,
      timestamp: m.timestamp,
    }));

    return res.status(200).json({
      username: acc.username,
      account: account.data || [],
      rows,
    });
  } catch (e) {
    return res.status(502).json({ error: e.message });
  }
}
