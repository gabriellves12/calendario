/**
 * Armazenamento chave-valor sobre Redis (Upstash) via API REST — sem dependências.
 * Funciona com as variáveis do "Vercel KV" (KV_REST_API_*) OU do provedor
 * Upstash no Marketplace (UPSTASH_REDIS_REST_*). Se nenhuma existir, cai para
 * memória efêmera (bom para testes locais; perde dados ao reiniciar).
 */
// Descobre a URL e o token do Redis, qualquer que seja o prefixo das variáveis
// criadas pela Vercel (KV_*, UPSTASH_REDIS_*, STORAGE_*, etc.).
function resolveRedisEnv() {
  let url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  let token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url) {
    const k = Object.keys(process.env).find((k) => /REST_API_URL$/.test(k));
    if (k) url = process.env[k];
  }
  if (!token) {
    // evita o token "read only" — precisamos de escrita (SET/DEL)
    const k = Object.keys(process.env).find((k) => /REST_API_TOKEN$/.test(k) && !/READ_ONLY/.test(k));
    if (k) token = process.env[k];
  }
  return { url: url || '', token: token || '' };
}
const { url: URL, token: TOKEN } = resolveRedisEnv();
const HAS_REDIS = !!(URL && TOKEN);

const _mem = new Map();
let _warned = false;
function warnOnce() {
  if (!_warned) { _warned = true; console.warn('[store] Redis (KV/Upstash) não configurado — usando memória efêmera.'); }
}

/** Envia um comando Redis no formato de array para a REST API do Upstash. */
async function redis(...command) {
  const r = await fetch(URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
  });
  const json = await r.json().catch(() => ({}));
  if (!r.ok || json.error) throw new Error(json.error || `Redis erro (${r.status})`);
  return json.result;
}

export async function setItem(key, value) {
  if (!HAS_REDIS) { warnOnce(); _mem.set(key, value); return; }
  await redis('SET', key, JSON.stringify(value));
}

export async function getItem(key) {
  if (!HAS_REDIS) { warnOnce(); return _mem.has(key) ? _mem.get(key) : null; }
  const v = await redis('GET', key);
  if (v == null) return null;
  try { return JSON.parse(v); } catch { return v; }
}

export async function delItem(key) {
  if (!HAS_REDIS) { warnOnce(); _mem.delete(key); return; }
  await redis('DEL', key);
}

/* Chaves usadas pelo app */
export const KEYS = {
  igAccount: 'ig:account',   // { igUserId, accessToken, username, ... }
  posts: 'posts:all',        // espelho opcional dos posts (futuro)
};
