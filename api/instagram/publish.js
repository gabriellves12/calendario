/**
 * POST /api/instagram/publish
 * Body: { type: 'reels'|'imagem'|..., caption, mediaUrl }
 *
 * Publica de fato no Instagram. É o destino do botão "Postar agora".
 * IMPORTANTE: mediaUrl precisa ser uma URL pública de imagem/vídeo
 * (o link bruto do Google Drive normalmente NÃO funciona — ver README).
 */
import { requireAuth } from '../_lib/auth.js';
import { getItem, KEYS } from '../_lib/store.js';
import { publishImage, publishReel } from '../_lib/ig.js';

export default async function handler(req, res) {
  if (!requireAuth(req, res)) return;
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'método não permitido' });
  }

  const { type, caption = '', mediaUrl } = req.body || {};
  if (!mediaUrl) return res.status(400).json({ error: 'mediaUrl (URL pública da imagem/vídeo) é obrigatório.' });

  const acc = await getItem(KEYS.igAccount);
  if (!acc) return res.status(409).json({ error: 'Instagram não conectado. Conecte a conta antes de publicar.' });

  try {
    const ctx = { igUserId: acc.igUserId, accessToken: acc.accessToken, caption };
    let result;
    if (type === 'reels' || type === 'live') {
      result = await publishReel({ ...ctx, videoUrl: mediaUrl });
    } else {
      // imagem, carrossel (single), story-imagem
      result = await publishImage({ ...ctx, imageUrl: mediaUrl });
    }
    return res.status(200).json({ ok: true, mediaId: result.id });
  } catch (e) {
    return res.status(502).json({ error: e.message });
  }
}
