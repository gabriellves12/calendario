/**
 * Armazenamento chave-valor sobre Redis.
 * Usa o cliente node-redis com a variável REDIS_URL (criada pela integração Redis
 * da Vercel). Se nenhuma URL existir, cai para memória efêmera (testes locais).
 */
import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL || process.env.KV_URL || '';
const HAS_REDIS = !!REDIS_URL;

const _mem = new Map();
let _client = null;
let _warned = false;

async function getClient() {
  if (!HAS_REDIS) {
    if (!_warned) { _warned = true; console.warn('[store] REDIS_URL ausente — usando memória efêmera.'); }
    return null;
  }
  if (!_client) {
    _client = createClient({ url: REDIS_URL });
    _client.on('error', (e) => console.error('[redis]', e.message));
  }
  if (!_client.isOpen) await _client.connect();
  return _client;
}

export async function setItem(key, value) {
  const c = await getClient();
  if (!c) { _mem.set(key, value); return; }
  await c.set(key, JSON.stringify(value));
}

export async function getItem(key) {
  const c = await getClient();
  if (!c) return _mem.has(key) ? _mem.get(key) : null;
  const v = await c.get(key);
  if (v == null) return null;
  try { return JSON.parse(v); } catch { return v; }
}

export async function delItem(key) {
  const c = await getClient();
  if (!c) { _mem.delete(key); return; }
  await c.del(key);
}

/* Chaves usadas pelo app */
export const KEYS = {
  igAccount: 'ig:account',   // { igUserId, accessToken, username, ... }
  posts: 'posts:all',        // espelho opcional dos posts (futuro)
};
