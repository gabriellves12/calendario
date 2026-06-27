/**
 * Cliente da Instagram Graph API (publicação via conta Business + Facebook Login).
 * Docs: https://developers.facebook.com/docs/instagram-api
 *
 * Todas as funções aqui são "puras" sobre a Graph API — recebem o token e os
 * parâmetros e devolvem o JSON. A orquestração fica nas rotas /api/instagram/*.
 */
const V = process.env.GRAPH_API_VERSION || 'v21.0';
const GRAPH = `https://graph.facebook.com/${V}`;
const FB_DIALOG = `https://www.facebook.com/${V}/dialog/oauth`;

const SCOPES = [
  'instagram_basic',
  'instagram_content_publish',
  'instagram_manage_insights',
  'pages_show_list',
  'pages_read_engagement',
].join(',');

async function graph(path, params = {}, method = 'GET') {
  const url = new URL(`${GRAPH}${path}`);
  if (method === 'GET') {
    Object.entries(params).forEach(([k, v]) => v != null && url.searchParams.set(k, v));
  }
  const opts = { method };
  if (method === 'POST') {
    const body = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v != null && body.set(k, v));
    opts.body = body;
  }
  const r = await fetch(url, opts);
  const json = await r.json();
  if (!r.ok || json.error) {
    const msg = json.error?.message || `Graph API erro (${r.status})`;
    throw new Error(msg);
  }
  return json;
}

/* ── OAuth ── */
export function authUrl(state) {
  const u = new URL(FB_DIALOG);
  u.searchParams.set('client_id', process.env.META_APP_ID);
  u.searchParams.set('redirect_uri', process.env.META_REDIRECT_URI);
  u.searchParams.set('scope', SCOPES);
  u.searchParams.set('response_type', 'code');
  u.searchParams.set('state', state);
  return u.toString();
}

export async function exchangeCodeForToken(code) {
  // 1) code → token de curta duração
  const short = await graph('/oauth/access_token', {
    client_id: process.env.META_APP_ID,
    client_secret: process.env.META_APP_SECRET,
    redirect_uri: process.env.META_REDIRECT_URI,
    code,
  });
  // 2) token de curta → token de longa duração (~60 dias)
  const long = await graph('/oauth/access_token', {
    grant_type: 'fb_exchange_token',
    client_id: process.env.META_APP_ID,
    client_secret: process.env.META_APP_SECRET,
    fb_exchange_token: short.access_token,
  });
  return long.access_token;
}

/* Descobre a conta Instagram Business vinculada à primeira Página do usuário */
export async function resolveIgAccount(userToken) {
  const pages = await graph('/me/accounts', { access_token: userToken, fields: 'id,name,access_token' });
  if (!pages.data?.length) throw new Error('Nenhuma Página do Facebook encontrada para esta conta.');

  for (const page of pages.data) {
    const info = await graph(`/${page.id}`, {
      access_token: page.access_token,
      fields: 'instagram_business_account{id,username}',
    });
    if (info.instagram_business_account) {
      return {
        igUserId: info.instagram_business_account.id,
        username: info.instagram_business_account.username,
        accessToken: page.access_token, // token da Página publica em nome da conta IG
        pageId: page.id,
      };
    }
  }
  throw new Error('Nenhuma conta Instagram Business vinculada às Páginas encontradas.');
}

/* ── Publicação (2 passos) ── */
export async function publishImage({ igUserId, accessToken, imageUrl, caption }) {
  const container = await graph(`/${igUserId}/media`, {
    image_url: imageUrl, caption, access_token: accessToken,
  }, 'POST');
  return await graph(`/${igUserId}/media_publish`, {
    creation_id: container.id, access_token: accessToken,
  }, 'POST');
}

export async function publishReel({ igUserId, accessToken, videoUrl, caption }) {
  const container = await graph(`/${igUserId}/media`, {
    media_type: 'REELS', video_url: videoUrl, caption, access_token: accessToken,
  }, 'POST');
  // vídeo precisa terminar o processamento antes de publicar
  await waitForContainer(igUserId, accessToken, container.id);
  return await graph(`/${igUserId}/media_publish`, {
    creation_id: container.id, access_token: accessToken,
  }, 'POST');
}

async function waitForContainer(igUserId, accessToken, creationId, tries = 12) {
  for (let i = 0; i < tries; i++) {
    const s = await graph(`/${creationId}`, { fields: 'status_code', access_token: accessToken });
    if (s.status_code === 'FINISHED') return;
    if (s.status_code === 'ERROR') throw new Error('Falha no processamento do vídeo.');
    await new Promise((r) => setTimeout(r, 3000));
  }
  throw new Error('Tempo esgotado aguardando o processamento do vídeo.');
}

/* ── Métricas ── */
export async function accountInsights(igUserId, accessToken) {
  // métricas da conta (período diário)
  const metrics = 'reach,impressions,profile_views,follower_count';
  const data = await graph(`/${igUserId}/insights`, {
    metric: metrics, period: 'day', access_token: accessToken,
  });
  return data;
}

export async function recentMediaWithInsights(igUserId, accessToken, limit = 10) {
  const media = await graph(`/${igUserId}/media`, {
    access_token: accessToken, limit,
    fields: 'id,caption,media_type,timestamp,permalink,like_count,comments_count',
  });
  // insights por mídia (alcance, salvamentos, compartilhamentos)
  const out = [];
  for (const m of media.data || []) {
    let insights = {};
    try {
      const ins = await graph(`/${m.id}/insights`, {
        metric: 'reach,saved,shares', access_token: accessToken,
      });
      insights = Object.fromEntries((ins.data || []).map((d) => [d.name, d.values?.[0]?.value ?? 0]));
    } catch { /* alguns tipos de mídia não têm todas as métricas */ }
    out.push({ ...m, insights });
  }
  return out;
}
