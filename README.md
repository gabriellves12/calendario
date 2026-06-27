# Nevel MED · Painel de Conteúdo & Métricas

App web com duas telas — **Calendário de Conteúdo** e **Métricas** — para a equipe de marketing da Nevel MED programar posts e acompanhar o desempenho no Instagram.

- **Frontend:** HTML/CSS/JS puro (abre direto no navegador, sem build).
- **Backend:** funções serverless na **Vercel** (`/api`), com integração à **Instagram Graph API** pronta para conectar.

---

## 📁 Estrutura

```
.
├── index.html              # App (login + calendário + métricas)
├── styles.css              # Design system + estilos do app
├── app.js                  # Lógica do frontend (calendário, drawer, métricas, login)
├── design-system.html      # Living styleguide da marca
├── package.json
├── vercel.json
├── .env.example            # Modelo das variáveis de ambiente
└── api/                    # Backend serverless (Vercel)
    ├── login.js            # POST  /api/login      → cria sessão
    ├── logout.js           # POST  /api/logout
    ├── me.js               # GET   /api/me         → sessão atual
    ├── _lib/
    │   ├── auth.js         # sessão assinada (HMAC) + cookies
    │   ├── store.js        # armazenamento (Vercel KV + fallback)
    │   └── ig.js           # cliente da Instagram Graph API
    └── instagram/
        ├── connect.js      # GET   /api/instagram/connect     → inicia OAuth
        ├── callback.js     # GET   /api/instagram/callback     → troca code por token
        ├── status.js       # GET   /api/instagram/status       → conectado?
        ├── disconnect.js   # POST  /api/instagram/disconnect
        ├── publish.js      # POST  /api/instagram/publish      → "Postar agora"
        └── metrics.js      # GET   /api/instagram/metrics       → dados reais
```

> **Estado atual:** o frontend funciona 100% sozinho (dados salvos no navegador via `localStorage`; métricas em modo demonstração). O backend acima está **pronto e estruturado**, faltando apenas as credenciais da Meta e a ativação do KV para entrar em operação.

---

## 🔐 Login do painel

Usuário padrão do time (atualmente validado no frontend e também no backend):

```
Usuário: nevel2026
Senha:   marketing
```

No backend, isso vira as variáveis `TEAM_USER` / `TEAM_PASS`. Para trocar a senha, basta alterar essas variáveis na Vercel.

---

## 🚀 Deploy na Vercel

1. Suba o projeto para um repositório (GitHub/GitLab) **ou** rode `vercel` na pasta.
2. Em **Vercel → New Project**, importe o repositório. Não há build step (frontend estático + funções `/api`).
3. Adicione um **KV Store**: aba **Storage → Create → KV**, conecte ao projeto. Isso injeta `KV_REST_API_URL` e `KV_REST_API_TOKEN` automaticamente.
4. Configure as variáveis de ambiente (próxima seção) em **Settings → Environment Variables**.
5. Deploy. A URL final (ex.: `https://nevel-conteudo.vercel.app`) é o endereço do painel.

Local: `npm install` e depois `vercel dev` para rodar frontend + API juntos.

---

## ⚙️ Variáveis de ambiente

Veja `.env.example`. As principais:

| Variável | Para quê |
|---|---|
| `TEAM_USER`, `TEAM_PASS` | Login do time |
| `SESSION_SECRET` | Assina o cookie de sessão (gere um valor longo aleatório) |
| `META_APP_ID`, `META_APP_SECRET` | Credenciais do app na Meta |
| `META_REDIRECT_URI` | `https://SEU-DOMINIO.vercel.app/api/instagram/callback` |
| `GRAPH_API_VERSION` | Versão da Graph API (padrão `v21.0`) |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Injetadas pela Vercel ao criar o KV |

---

## 📷 Conectar o Instagram (passo a passo)

Pré-requisitos da conta:
- Instagram **Business** ou **Creator**;
- vinculado a uma **Página do Facebook**.

No **Meta for Developers** (https://developers.facebook.com):
1. **Crie um app** (tipo "Business").
2. Adicione os produtos **Facebook Login** e **Instagram Graph API**.
3. Em Facebook Login → Settings, cadastre o **Valid OAuth Redirect URI**:
   `https://SEU-DOMINIO.vercel.app/api/instagram/callback`
4. Copie **App ID** e **App Secret** para as variáveis `META_APP_ID` / `META_APP_SECRET`.
5. Solicite as permissões (App Review): `instagram_basic`, `instagram_content_publish`,
   `instagram_manage_insights`, `pages_show_list`, `pages_read_engagement`.
   - Durante o desenvolvimento, adicione sua conta como **tester/usuário do app** para testar antes da aprovação.

Fluxo dentro do painel:
- **Conectar** → `GET /api/instagram/connect` redireciona para a Meta → você autoriza →
  `callback` guarda o token de longa duração (~60 dias) no KV.
- **Postar agora** → `POST /api/instagram/publish`.
- **Métricas** → `GET /api/instagram/metrics`.

### ⚠️ Sobre as mídias (importante)
A Graph API **baixa a imagem/vídeo de uma URL pública** — ela não recebe o arquivo direto.
O link comum do Google Drive **não funciona** como `mediaUrl`. Opções:
- Hospedar os arquivos num bucket público (Vercel Blob, S3, Cloudinary, etc.) e usar essa URL; **ou**
- Converter o link do Drive para formato de download direto (frágil, não recomendado para produção).

O campo **"Drive com o conteúdo"** no app serve para a equipe organizar os arquivos-fonte.
Para a publicação automática, a etapa de hospedar a mídia final com URL pública será o próximo passo da integração.

---

## 🔌 Como ligar o frontend ao backend (quando for a hora)

Hoje o `app.js` usa `localStorage` e dados de demonstração. Para usar o backend, troque os pontos marcados:

- **Login:** no `initAuth`, em vez de comparar no cliente, chamar `POST /api/login` e, no load, `GET /api/me`.
- **Postar:** no `publishPost`, chamar `POST /api/instagram/publish` com `{ type, caption, mediaUrl }`.
- **Métricas:** no `renderMetrics`, buscar `GET /api/instagram/status` e `GET /api/instagram/metrics`.

Cada rota já devolve JSON no formato que o frontend espera. É só plugar.
