# 📷 Guia: conectar o Instagram da Nevel MED (via Meta)

Passo a passo completo para ativar a conexão real do Instagram no painel.
Faça **na ordem**. Se uma tela estiver diferente (a Meta muda o layout às vezes),
veja a seção **Solução de problemas** no fim — ou me chame com um print.

---

## ✅ Antes de começar, você precisa de:
- Estar logada no Facebook com a conta **administradora da Página** da Nevel MED.
- O Instagram da empresa precisa ser **Profissional (Empresa/Criador)** e estar
  **vinculado a essa Página do Facebook**. *(Já está, confirmado.)*
- A **URL do site na Vercel** (ex.: `https://calendario-xxxx.vercel.app`).

> 🔒 **Regra de ouro de segurança:** a *Chave Secreta do app* vai **somente** nas
> variáveis da Vercel. Nunca cole ela em e-mail, chat ou print.

---

## FASE 1 — Criar o app na Meta
1. Acesse **https://developers.facebook.com**.
2. Clique em **"Meus Apps"** (canto superior direito).
3. Primeira vez? Faça o **registro como desenvolvedor** (aceitar termos, confirmar
   por e-mail/celular).
4. Clique em **"Criar app"**.
5. Em **"Caso de uso"** → escolha **"Outro"** → **Avançar**.
6. Em **tipo de app** → **"Empresa" (Business)** → **Avançar**.
7. Nome do app (ex.: `Nevel MED Conteúdo`), confirme o e-mail → **"Criar app"**
   (pode pedir sua senha do Facebook).

## FASE 2 — Adicionar os produtos
No painel do app (menu lateral esquerdo):
1. Encontre **"Login do Facebook"** → **"Configurar"**.
   - Se perguntar a plataforma, escolha **"Web"**. Pode **pular** o assistente de
     código (não precisamos colar nada).
2. Encontre **"Instagram"** (Instagram Graph API) → **"Configurar"**.

## FASE 3 — Configurar o redirecionamento (atenção redobrada aqui)
1. Menu lateral → **Login do Facebook → Configurações**.
2. No campo **"URIs de redirecionamento do OAuth válidos"**, cole EXATAMENTE
   (trocando pela sua URL real):
   ```
   https://SUA-URL.vercel.app/api/instagram/callback
   ```
   - Sem espaço no fim, sem barra a mais, **https** (não http).
3. Confirme que estão **ATIVADOS**:
   - **"Login do OAuth do cliente"**
   - **"Login do OAuth da Web"**
4. **"Salvar alterações"**.

## FASE 4 — Liberar o teste (sem revisão da Meta)
1. Menu → **Funções do app → Funções**.
2. Confirme que **você** é **Administrador**. (Quem for testar entra como **Testador**.)
3. Mantenha o app em **modo "Desenvolvimento"** (topo do painel).
   Em desenvolvimento ele já funciona **para a conta de vocês** — sem precisar de
   App Review agora.

## FASE 5 — Copiar as credenciais
1. Menu → **Configurações do app → Básico**.
2. Copie o **ID do app** (App ID).
3. Em **Chave secreta do app** → **"Mostrar"** → copie. 🔒 (só na Vercel!)

## FASE 6 — Configurar na Vercel
1. Banco para guardar o token. A Vercel mudou: o "KV" agora vem do **Marketplace**.
   - Vá em **Storage**. Se **não aparecer "KV"** (só Blob/Edge Config), role até
     **"Marketplace Database Providers"** e escolha **Upstash → Redis**
     (pode aparecer como "Serverless Redis" ou "KV").
   - Crie (plano **Free** serve), **conecte ao projeto** e confirme. Isso adiciona
     as variáveis de conexão sozinho (`KV_REST_API_*` ou `UPSTASH_REDIS_REST_*`) —
     o app aceita as duas.
2. **Settings → Environment Variables** → adicione (ambiente **Production**):

   | Nome | Valor |
   |---|---|
   | `META_APP_ID` | o ID do app |
   | `META_APP_SECRET` | a chave secreta |
   | `META_REDIRECT_URI` | `https://SUA-URL.vercel.app/api/instagram/callback` |
   | `SESSION_SECRET` | um texto longo e aleatório qualquer |
   | `GRAPH_API_VERSION` | `v21.0` |

3. **Deployments** → no último deploy → **⋯ → Redeploy**.

## FASE 7 — Testar a conexão
1. Abra o site da Vercel → entre (`nevel2026` / `marketing`).
2. Aba **Métricas** → **"Conectar Instagram"**.
3. O Facebook abre pedindo autorização → **aceite tudo** (Página + Instagram).
4. Você volta ao painel **conectado**, com as métricas reais. ✅

---

## 🛠️ Solução de problemas (erros comuns)

**"URL bloqueada" / "Invalid OAuth redirect URI"**
→ O endereço no campo da Fase 3 não bate com o `META_REDIRECT_URI` da Vercel.
Eles têm que ser **idênticos**, caractere por caractere (https, sem barra extra).

**"Não foi possível carregar o app" / app em modo Live exige revisão**
→ Deixe o app em **Desenvolvimento** (Fase 4) e confirme que você está como
Administrador/Testador.

**"Função de desenvolvedor é insuficiente" (ao conectar/adicionar conta)**
→ A conta que autoriza não tem papel no app, ou o convite não foi aceito. Resolva
os DOIS pontos:
  1. **Funções do app → Funções → Adicionar pessoas** → adicione como
     **Administrador/Testador** a conta do Facebook que administra a Página
     (a mesma usada no login) → e **aceite o convite** em developers.facebook.com
     (sininho de notificações) com essa conta.
  2. **Testador do Instagram:** adicione o usuário @ do Instagram em
     *Funções → Testadores do Instagram*, depois **aceite dentro do Instagram**:
     *Configurações → Apps e sites → Convites de testador → Aceitar*.
→ Causa mais comum: autorizar com uma **conta do Facebook diferente** da que criou
o app / administra a Página.

**"Nenhuma conta Instagram Business encontrada" ao conectar**
→ O Instagram não está vinculado à Página, OU a conta ainda é pessoal.
Vá no app do Instagram → *Editar perfil → Página* e conecte a Página do Facebook.

**Conectou, mas as métricas não aparecem**
→ Algumas métricas só existem após o post ter alcance; contas novas podem vir
zeradas. Não é erro de configuração.

**Quero postar automático (botão "Postar agora")**
→ Funciona, mas a Meta exige a mídia numa **URL pública** (link do Google Drive
normalmente não serve). Falar com o desenvolvedor para habilitar a hospedagem de
mídia (Vercel Blob/Cloudinary).

---

## 📋 Cole aqui suas anotações enquanto faz
- URL da Vercel: `__________________________`
- App ID: `__________________________`
- Redirect URI usado: `__________________________`
- [ ] FASE 1 ok  · [ ] FASE 2 ok  · [ ] FASE 3 ok  · [ ] FASE 4 ok
- [ ] FASE 5 ok  · [ ] FASE 6 ok  · [ ] FASE 7 ok ✅
