/**
 * GET /api/instagram/callback?code=...
 * Recebe o retorno do OAuth, troca o code por um token de longa duração,
 * descobre a conta Instagram Business e guarda tudo no KV.
 */
import { requireAuth } from '../_lib/auth.js';
import { exchangeCodeForToken, resolveIgAccount } from '../_lib/ig.js';
import { setItem, KEYS } from '../_lib/store.js';

export default async function handler(req, res) {
  if (!requireAuth(req, res)) return;

  const { code, error, error_description } = req.query;
  if (error) return res.status(400).send(`Autorização negada: ${error_description || error}`);
  if (!code) return res.status(400).send('Parâmetro "code" ausente.');

  try {
    const userToken = await exchangeCodeForToken(code);
    const account = await resolveIgAccount(userToken);

    await setItem(KEYS.igAccount, {
      igUserId: account.igUserId,
      username: account.username,
      accessToken: account.accessToken,
      pageId: account.pageId,
      connectedAt: Date.now(),
    });

    // volta para o painel, na aba de métricas
    res.redirect(302, '/?ig=connected#metrics');
  } catch (e) {
    res.status(500).send(`Falha ao conectar o Instagram: ${e.message}`);
  }
}
