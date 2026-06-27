# Design System — Nevel MED

**Estilo:** Minimalista + Tech  
**Família tipográfica principal:** Instrument Sans  
**Cor primária:** `#06C4FE`  
**Background:** Branco puro — uma única dobra em `#E4F6FD`

---

## 1. Paleta de cores

### Primária
Extraída diretamente do `[PALETA DE CORES].svg`. Ciano tech, vibrante e frio — usada em CTAs, links ativos e destaques pontuais.

| Token | HEX | Uso |
|---|---|---|
| `--color-primary` | `#06C4FE` | Botões CTA, links, destaques |
| `--color-primary-hover` | `#05AEDE` | Estado hover do botão primário |
| `--color-primary-light` | `#E0F9FF` | Fundos de badges, highlights sutis |

### Secundária
Azul royal, presente na paleta e no gradiente do badge MED. Complementa a primária em elementos de suporte.

| Token | HEX | Uso |
|---|---|---|
| `--color-secondary` | `#2D5AD8` | Gradiente da logo, acentos secundários |
| `--color-secondary-light` | `#EEF2FD` | Fundos suaves de elementos secundários |

### Neutras
Tom levemente azulado — coerente com o estilo tech e a identidade da marca.

| Token | HEX | Uso |
|---|---|---|
| `--color-neutral-900` | `#232E48` | Texto principal, headlines |
| `--color-neutral-700` | `#384266` | Texto secundário, subtítulos |
| `--color-neutral-500` | `#636D86` | Texto auxiliar, legendas |
| `--color-neutral-400` | `#8892A9` | Placeholders, texto muted |
| `--color-neutral-100` | `#E4F6FD` | **A única dobra "cinza"** — fundos de seção |
| `--color-neutral-50` | `#F3FCFF` | Fundo base alternativo (quase branco) |
| `--color-neutral-0` | `#FFFFFF` | Background principal da página |

> **Regra de uso do background:** a página é branca (`#FFFFFF`). Apenas uma seção usa `#E4F6FD` como fundo para criar separação visual sem peso.

### Semânticas

| Token | HEX | Uso |
|---|---|---|
| `--color-success` | `#10B981` | Confirmações, checkmarks |
| `--color-error` | `#EF4444` | Erros, alertas críticos |
| `--color-warning` | `#F59E0B` | Avisos |
| `--color-info` | `#06C4FE` | Info (usa a primária) |

### Tokens da logo
Não usar esses gradientes em elementos de UI — são exclusivos da identidade da marca.

| Token | Valor | Uso |
|---|---|---|
| `--color-logo-grad-start` | `#FFFFFF` | Símbolo — stop inicial |
| `--color-logo-grad-mid-1` | `#00C3FF` | Símbolo — transição ciano |
| `--color-logo-grad-mid-2` | `#1D81E7` | Símbolo — transição azul |
| `--color-logo-grad-end` | `#3C3CCE` | Símbolo — stop final índigo |
| `--color-badge-start` | `#06C4FE` | Badge MED — stop inicial |
| `--color-badge-end` | `#2D5AD8` | Badge MED — stop final |
| `--color-logo-text-dark` | `#232E48` | Wordmark sobre fundo claro (LOGO 01) |
| `--color-logo-text-light` | `#CAF3FF` | Wordmark sobre fundo escuro (LOGO 02) |

---

## 2. Tipografia

**Família única:** Instrument Sans — sem-serif geométrica, limpa e com personalidade tech. Pesos minimalistas: apenas Regular e Medium.

| Token | Valor |
|---|---|
| `--font-family` | `'Instrument Sans', system-ui, sans-serif` |
| `--font-weight-regular` | `400` |
| `--font-weight-medium` | `500` |

> **Por que só 2 pesos?** Minimalismo tipográfico: a hierarquia é feita por tamanho e cor, não por peso. Bold chamaria atenção demais para um visual que preza pela quietude.

### Escala de tamanhos (regra de 8)

| Papel | Tamanho | Peso | Token |
|---|---|---|---|
| Display / H1 | `48px` | Medium (500) | `--text-display` |
| H2 | `40px` | Medium (500) | `--text-h2` |
| H3 | `24px` | Medium (500) | `--text-h3` |
| Body large | `18px` | Regular (400) | `--text-body-lg` |
| Body | `16px` | Regular (400) | `--text-body` |
| Small / Caption | `14px` | Regular (400) | `--text-sm` |
| Micro | `12px` | Regular (400) | `--text-xs` |

### Google Fonts

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500&display=swap" rel="stylesheet">
```

---

## 3. Princípios visuais

### Estilo: Minimalista + Tech

| Decisão | Regra |
|---|---|
| **Background** | `#FFFFFF` na grande maioria — uma dobra em `#E4F6FD` |
| **Saturação** | Cor viva apenas na primária (`#06C4FE`) — tudo mais é neutro frio |
| **Gradientes** | Exclusivos da logo/badge. Proibido em elementos de UI genéricos |
| **Sombras** | Nenhuma. Separação visual feita por cor de fundo, não por elevação |
| **Bordas** | `1px solid #E4F6FD` — quando necessário. Nunca opacas |

### Border-radius

| Token | Valor | Uso |
|---|---|---|
| `--radius-xs` | `4px` | Badges, tags, inputs |
| `--radius-sm` | `8px` | Botões, campos pequenos |
| `--radius-md` | `12px` | Cards, painéis |
| `--radius-lg` | `20px` | Seções, containers grandes |
| `--radius-full` | `9999px` | Pills, avatares |

### Sombras
Sem sombras. Separação exclusivamente por contraste de background.

### Interações (obrigatórias em todos os elementos clicáveis)

| Elemento | Interação |
|---|---|
| Botões | `transition: background 200ms ease, color 200ms ease` |
| Links / nav | `transition: color 150ms ease` |
| Cards | `transition: background 200ms ease` — sutil no hover |
| Ícones / elementos | `transition: transform 200ms ease` — translate ou scale leve |
| Animações de entrada | `opacity 0 → 1` + `translateY(16px) → 0` em `400ms ease` |

> **Regra de ouro das interações:** nada pisca, nada pula. Tudo desliza com suavidade. A sensação deve ser de precisão cirúrgica, não de efeito especial.

### Espaçamento
Grid de 20px. Dentro de dobras: múltiplos de 8 (8, 16, 24, 32, 40, 48, 64, 80).

---

## 4. Logos — guia de uso

### LOGO 01 — versão positiva (para fundos claros)
- Símbolo: gradiente `#FFFFFF → #00C3FF → #3C3CCE`
- Wordmark "NEVEL": `#232E48`
- Badge "MED": gradiente `#06C4FE → #2D5AD8`, texto `#CAF3FF`
- **Usar em:** fundo branco, fundo `#F3FCFF`, fundo `#E4F6FD`

### LOGO 02 — versão negativa (para fundos escuros)
- Símbolo: mesmo gradiente
- Wordmark "NEVEL": `#CAF3FF`
- Badge "MED": mesmo gradiente, texto `#CAF3FF`
- **Usar em:** fundo `#232E48` ou mais escuro

### Regras de não-uso
- Não rotacionar a logo
- Não separar símbolo do wordmark
- Não recolorizar o badge MED
- Área de respiro mínima: altura da letra "N" em cada lado

---

## 5. CSS Variables completo

```css
:root {
  /* ── Primária ── */
  --color-primary:          #06C4FE;
  --color-primary-hover:    #05AEDE;
  --color-primary-light:    #E0F9FF;

  /* ── Secundária ── */
  --color-secondary:        #2D5AD8;
  --color-secondary-light:  #EEF2FD;

  /* ── Neutras ── */
  --color-neutral-900:      #232E48;
  --color-neutral-700:      #384266;
  --color-neutral-500:      #636D86;
  --color-neutral-400:      #8892A9;
  --color-neutral-100:      #E4F6FD;
  --color-neutral-50:       #F3FCFF;
  --color-neutral-0:        #FFFFFF;

  /* ── Semânticas ── */
  --color-success:          #10B981;
  --color-error:            #EF4444;
  --color-warning:          #F59E0B;
  --color-info:             #06C4FE;

  /* ── Logo ── */
  --color-logo-text-dark:   #232E48;
  --color-logo-text-light:  #CAF3FF;
  --color-badge-start:      #06C4FE;
  --color-badge-end:        #2D5AD8;

  /* ── Tipografia ── */
  --font-family:            'Instrument Sans', system-ui, sans-serif;
  --font-weight-regular:    400;
  --font-weight-medium:     500;

  --text-display:           48px;
  --text-h2:                40px;
  --text-h3:                24px;
  --text-body-lg:           18px;
  --text-body:              16px;
  --text-sm:                14px;
  --text-xs:                12px;

  /* ── Border radius ── */
  --radius-xs:              4px;
  --radius-sm:              8px;
  --radius-md:              12px;
  --radius-lg:              20px;
  --radius-full:            9999px;

  /* ── Transições ── */
  --transition-fast:        150ms ease;
  --transition-base:        200ms ease;
  --transition-enter:       400ms ease;

  /* ── Gradiente da logo (só para o símbolo SVG) ── */
  --logo-gradient: linear-gradient(
    135deg,
    #FFFFFF 3%,
    #00C3FF 38%,
    #05B5FA 42%,
    #1D81E7 57%,
    #2D5BD9 69%,
    #3844D1 79%,
    #3C3CCE 86%
  );

  /* ── Gradiente do badge MED ── */
  --badge-gradient: linear-gradient(
    135deg,
    #06C4FE 0%,
    #2D5AD8 100%
  );
}
```

---

## 6. Componentes base

### Botão primário
```css
.btn-primary {
  background: var(--color-primary);
  color: var(--color-neutral-900);
  font-family: var(--font-family);
  font-weight: var(--font-weight-medium);
  font-size: var(--text-body);
  border-radius: var(--radius-sm);
  border: none;
  padding: 12px 28px;
  cursor: pointer;
  transition: background var(--transition-base), color var(--transition-base);
}
.btn-primary:hover {
  background: var(--color-primary-hover);
}
```

> Texto escuro (`#232E48`) sobre o ciano — contraste ≥ 4.5:1 ✅

### Botão outline
```css
.btn-outline {
  background: transparent;
  color: var(--color-neutral-900);
  border: 1px solid var(--color-neutral-400);
  font-family: var(--font-family);
  font-weight: var(--font-weight-regular);
  font-size: var(--text-body);
  border-radius: var(--radius-sm);
  padding: 12px 28px;
  cursor: pointer;
  transition: border-color var(--transition-base), color var(--transition-base);
}
.btn-outline:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
```

### Animação de entrada padrão
```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

.animate-in {
  animation: fadeUp var(--transition-enter) both;
}
.animate-in-delay-1 { animation-delay: 100ms; }
.animate-in-delay-2 { animation-delay: 200ms; }
.animate-in-delay-3 { animation-delay: 300ms; }
```

---

## Checklist de conformidade

- [x] Paleta extraída do arquivo oficial `[PALETA DE CORES].svg`
- [x] Primária com hover e light
- [x] Secundária com light
- [x] 7 tons de neutros (levemente azulados — coerência tech)
- [x] 4 cores semânticas
- [x] Contraste texto/botão verificado (texto `#232E48` sobre `#06C4FE` ≥ 4.5:1)
- [x] Fonte Instrument Sans — pesos 400 e 500 apenas
- [x] Link Google Fonts gerado
- [x] Border-radius geométrico (4–20px) — estilo minimalista/tech
- [x] Sem sombras
- [x] Gradientes exclusivos para logo e badge
- [x] Tokens de logo (positivo e negativo) documentados
- [x] Interações definidas com timing
- [x] CSS variables completo e pronto para usar
- [x] Uma única dobra em `#E4F6FD` documentada como regra

---

✅ **Design system pronto.** Agora você pode pedir a construção da landing page — vou usar exatamente essas cores, essa fonte e esses princípios. Me fala o que quer construir primeiro.
