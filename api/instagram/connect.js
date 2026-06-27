/**
 * GET /api/instagram/connect
 * Inicia o fluxo OAuth da Meta — redireciona o usuário para autorizar o app.
 * Protegido: só usuários logados no painel podem conectar.
 */
import { requireAuth } from '../_lib/auth.js';
import { authUrl } from '../_lib/ig.js';

export default async function handler(req, res) {
  if (!requireAuth(req, res)) return;

  if (!process.env.META_APP_ID || !process.env.META_REDIRECT_URI) {
    return res.status(500).json({
      error: 'App da Meta não configurado. Defina META_APP_ID, META_APP_SECRET e META_REDIRECT_URI.',
    });
  }

  // state simples anti-CSRF (em produção, persista e valide no callback)
  const state = Math.random().toString(36).slice(2);
  res.redirect(302, authUrl(state));
}
