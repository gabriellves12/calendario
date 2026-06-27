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

// Padrão: Haiku (mais barato). Pode trocar via ANTHROPIC_MODEL.
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5';
// Modelos que suportam busca com filtragem dinâmica + raciocínio adaptativo (Opus 4.6+/Sonnet 4.6).
// Haiku e modelos antigos usam a busca básica e NÃO aceitam thinking/effort.
const ADVANCED = /opus-4-(6|7|8)|sonnet-4-6|fable-5/.test(MODEL);

const SYSTEM = `Você é o pesquisador do "Nevel MED Radar", o conteúdo de notícias da Nevel MED — agência de marketing especializada no nicho de saúde.
Sua função: buscar na web as notícias e tendências MAIS RECENTES sobre o tema pedido e entregar um briefing pronto para a equipe de conteúdo.

Linha editorial do Radar (foque nisso):
- Notícias e tendências do mercado de SAÚDE em geral (clínicas, hospitais, healthtechs, regulação, comportamento do paciente).
- MARKETING e marketing médico (estratégias, plataformas, mudanças de algoritmo, casos relevantes).
- Notícias gerais do MERCADO que impactam o setor de saúde.

Regras:
- Sempre faça buscas na web para trazer informação atual — não responda de memória.
- Responda em português do Brasil.
- Formato: uma lista de 5 a 7 itens. Cada item em uma linha começando com "- ", contendo: o fato/notícia em uma frase + (entre parênteses) por que importa / ângulo de conteúdo para a Nevel MED e a data, quando houver.
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
    type: ADVANCED ? 'web_search_20260209' : 'web_search_20250305',
    name: 'web_search',
    max_uses: 6,
  }];
  // thinking/effort só nos modelos que suportam (Haiku rejeitaria com erro 400)
  const baseParams = { model: MODEL, max_tokens: 4096, system: SYSTEM, tools };
  if (ADVANCED) {
    baseParams.thinking = { type: 'adaptive' };
    baseParams.output_config = { effort: 'low' };
  }

  try {
    let messages = [{ role: 'user', content: query }];
    const textParts = [];
    const sources = [];
    const seen = new Set();
    let guard = 0;

    while (true) {
      const resp = await client.messages.create({ ...baseParams, messages });

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
