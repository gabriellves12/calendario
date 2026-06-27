/**
 * Armazenamento simples chave-valor.
 * Usa Vercel KV quando disponível; cai para memória efêmera em dev/local
 * (os dados se perdem ao reiniciar — bom o suficiente para testes).
 */
let _kv = null;          // instância do KV, ou false se ausente
const _mem = new Map();  // fallback em memória

async function kv() {
  if (_kv !== null) return _kv;
  try {
    const mod = await import('@vercel/kv');
    // Só usa se as variáveis do KV existirem
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      _kv = mod.kv;
    } else {
      _kv = false;
      console.warn('[store] KV não configurado — usando memória efêmera.');
    }
  } catch {
    _kv = false;
    console.warn('[store] @vercel/kv ausente — usando memória efêmera.');
  }
  return _kv;
}

export async function setItem(key, value) {
  const c = await kv();
  if (c) return c.set(key, value);
  _mem.set(key, value);
}

export async function getItem(key) {
  const c = await kv();
  if (c) return await c.get(key);
  return _mem.has(key) ? _mem.get(key) : null;
}

export async function delItem(key) {
  const c = await kv();
  if (c) return c.del(key);
  _mem.delete(key);
}

/* Chaves usadas pelo app */
export const KEYS = {
  igAccount: 'ig:account',   // { igUserId, accessToken, username, expiresAt }
  posts: 'posts:all',        // espelho opcional dos posts (futuro)
};
