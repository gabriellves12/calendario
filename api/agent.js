/**
 * POST /api/agent   { query }
 * Agente de IA (Claude) que busca notícias recentes na web sobre marketing,
 * saúde e medicina e devolve um briefing com fontes.
 *
 * Usa a API da Anthropic com a ferramenta server-side de busca na web.
 * Requer a variável ANTHROPIC_API_KEY (crie em https://console.anthropic.com).
 */
import Anthropic from '@anthropic-ai/sdk';
import { requireAuth } from './_lib/auth.js';

// Hobby da Vercel permite até 60s; busca na web + raciocínio pode levar alguns segundos.
export const config = { maxDuration: 60 };

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-4-8';
// A busca com filtragem dinâmica exige Opus 4.6+/Sonnet 4.6; modelos antigos usam a básica.
const WS_ADVANCED = /opus-4-(6|7|8)|sonnet-4-6|fable-5/.test(MODEL);

const SYSTEM = `Você é o assistente de pesquisa da Nevel MED, uma agência de marketing especializada no nicho de saúde.
Sua função: buscar na web as notícias e tendências MAIS RECENTES sobre o tema pedido (marketing, saúde, medicina ou o que for solicitado) e entregar um briefing pronto para a equipe de conteúdo.

Regras:
- Sempre faça buscas na web para trazer informação atual — não responda de memória.
- Responda em português do Brasil.
- Formato: uma lista de 5 a 7 itens. Cada item em uma linha começando com "- ", contendo: o fato/notícia em uma frase + (entre parênteses) por que importa para conteúdo de saúde e a data, quando houver.
- Seja conciso e direto. Sem introdução longa nem conclusão.
- Priorize fontes confiáveis e recentes.`;

export default async function handler(req, res) {
  if (!requireAuth(req, res)) return;
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'método não permitido' });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'Agente não configurado. Defina a variável ANTHROPIC_API_KEY na Vercel.' });
  }

  const query = (req.body?.query || '').toString().trim();
  if (!query) return res.status(400).json({ error: 'Informe o que pesquisar (query).' });

  const client = new Anthropic(); // lê ANTHROPIC_API_KEY do ambiente
  const tools = [{
    type: WS_ADVANCED ? 'web_search_20260209' : 'web_search_20250305',
    name: 'web_search',
    max_uses: 6,
  }];

  try {
    let messages = [{ role: 'user', content: query }];
    const textParts = [];
    const sources = [];
    const seen = new Set();
    let guard = 0;

    while (true) {
      const resp = await client.messages.create({
        model: MODEL,
        max_tokens: 4096,
        thinking: { type: 'adaptive' },
        output_config: { effort: 'low' },
        system: SYSTEM,
        tools,
        messages,
      });

      for (const block of resp.content) {
        if (block.type === 'text' && block.text) textParts.push(block.text);
        if (block.type === 'web_search_tool_result' && Array.isArray(block.content)) {
          for (const r of block.content) {
            if (r.type === 'web_search_result' && r.url && !seen.has(r.url)) {
              seen.add(r.url);
              sources.push({ title: r.title || r.url, url: r.url });
            }
          }
        }
      }

      // a busca na web roda um loop server-side; continua se pausar
      if (resp.stop_reason === 'pause_turn' && guard++ < 5) {
        messages.push({ role: 'assistant', content: resp.content });
        continue;
      }
      break;
    }

    return res.status(200).json({ text: textParts.join('').trim(), sources });
  } catch (e) {
    const msg = e?.error?.error?.message || e?.message || 'erro ao consultar o agente';
    return res.status(502).json({ error: msg });
  }
}
