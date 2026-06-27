/** POST /api/instagram/disconnect — remove a conexão guardada. */
import { requireAuth } from '../_lib/auth.js';
import { delItem, KEYS } from '../_lib/store.js';

export default async function handler(req, res) {
  if (!requireAuth(req, res)) return;
  await delItem(KEYS.igAccount);
  return res.status(200).json({ ok: true });
}
