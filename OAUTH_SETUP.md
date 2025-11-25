# 🚀 Guia Completo: OAuth + Domínio + Deploy
**Atualizado: 24/11/2024**

## 📌 ORDEM CORRETA DO PROCESSO

Siga EXATAMENTE esta ordem para evitar problemas:

1. ✅ **Configurar OAuth Providers** (Google + GitHub)
2. ✅ **Ativar OAuth no Supabase**
3. ✅ **Testar localmente** (`npm run dev`)
4. ✅ **Configurar domínio no Vercel**
5. ✅ **Configurar DNS na Hostinger**
6. ✅ **Aguardar propagação DNS** (10-30 min)
7. ✅ **Atualizar URLs no Supabase**
8. ✅ **Atualizar OAuth redirect URIs**
9. ✅ **Deploy para produção**
10. ✅ **Testar em produção**

---

## 🔐 PARTE 1: Configurar Google OAuth

### Passo 1.1: Criar Projeto no Google Cloud

1. Acesse: https://console.cloud.google.com/
2. Clique em **"Select a project"** (topo da página)
3. Clique em **"New Project"**
4. Preencha:
   - **Project name:** `Creative Hangar`
   - **Organization:** (deixe como está)
5. Clique em **"Create"**
6. Aguarde 30 segundos até o projeto ser criado

### Passo 1.2: Configurar OAuth Consent Screen

1. No menu lateral, vá em: **APIs & Services** → **OAuth consent screen**
2. Selecione **"External"**
3. Clique em **"Create"**

**Preencha o formulário:**

**App information:**
- App name: `Creative Hangar`
- User support email: Seu email
- App logo: (pode pular por enquanto)

**App domain:**
- Application home page: `https://creator-hangar-2y56pp3l6-creatorhangars-projects.vercel.app`
- Application privacy policy: (pode pular)
- Application terms of service: (pode pular)

**Authorized domains:**
- Clique em **"+ Add Domain"**
- Digite: `vercel.app`
- Clique em **"Add"**

**Developer contact information:**
- Email addresses: Seu email

4. Clique em **"Save and Continue"**
5. **Scopes:** Clique em **"Save and Continue"** (não precisa adicionar nada)
6. **Test users:** Clique em **"Save and Continue"** (não precisa adicionar)
7. Clique em **"Back to Dashboard"**

### Passo 1.3: Criar OAuth Credentials

1. No menu lateral, vá em: **APIs & Services** → **Credentials**
2. Clique em **"+ Create Credentials"** → **"OAuth client ID"**
3. **Application type:** Selecione **"Web application"**
4. **Name:** `Creative Hangar Web Client`

**Authorized JavaScript origins:**
- Clique em **"+ Add URI"**
- Adicione: `https://creator-hangar-2y56pp3l6-creatorhangars-projects.vercel.app`
- Clique em **"+ Add URI"** novamente
- Adicione: `http://localhost:3000`

**Authorized redirect URIs:**
- Clique em **"+ Add URI"**
- Adicione: `https://oqtmmzlfonhktxjnuilz.supabase.co/auth/v1/callback`
- Clique em **"+ Add URI"** novamente
- Adicione: `http://localhost:3000/auth/callback`

5. Clique em **"Create"**
6. **IMPORTANTE:** Uma janela vai aparecer com Client ID e Client Secret
7. **COPIE E SALVE** ambos em um lugar seguro (você vai precisar!)

---

## 🐙 PARTE 2: Configurar GitHub OAuth

### Passo 2.1: Criar OAuth App

1. Acesse: https://github.com/settings/developers
2. Clique em **"OAuth Apps"** (menu lateral)
3. Clique em **"New OAuth App"**

**Preencha o formulário:**
- **Application name:** `Creative Hangar`
- **Homepage URL:** `https://creator-hangar-2y56pp3l6-creatorhangars-projects.vercel.app`
- **Application description:** `Plataforma de ferramentas para criadores digitais`
- **Authorization callback URL:** `https://oqtmmzlfonhktxjnuilz.supabase.co/auth/v1/callback`

4. Clique em **"Register application"**

### Passo 2.2: Gerar Client Secret

1. Na página do app que acabou de criar
2. **Client ID** já está visível - **COPIE E SALVE**
3. Clique em **"Generate a new client secret"**
4. **COPIE E SALVE** o Client Secret imediatamente (só aparece uma vez!)

---

## 🔧 PARTE 3: Ativar OAuth no Supabase

### Passo 3.1: Configurar Google Provider

1. Acesse: https://supabase.com/dashboard/project/oqtmmzlfonhktxjnuilz/auth/providers
2. Procure por **"Google"** na lista
3. Clique para expandir
4. **Enable Sign in with Google:** Ative (toggle para ON)
5. **Client ID (for OAuth):** Cole o Client ID do Google
6. **Client Secret (for OAuth):** Cole o Client Secret do Google
7. Clique em **"Save"**

### Passo 3.2: Configurar GitHub Provider

1. Na mesma página, procure por **"GitHub"**
2. Clique para expandir
3. **Enable Sign in with GitHub:** Ative (toggle para ON)
4. **Client ID:** Cole o Client ID do GitHub
5. **Client Secret:** Cole o Client Secret do GitHub
6. Clique em **"Save"**

### Passo 3.3: Desativar Email Provider

1. Na mesma página, procure por **"Email"**
2. Clique para expandir
3. **Enable Email Signup:** Desative (toggle para OFF)
4. **Enable Email provider:** Desative (toggle para OFF)
5. Clique em **"Save"**

---

## 🧪 PARTE 4: Testar Localmente

### Passo 4.1: Rodar o Projeto

1. Abra o terminal na pasta do projeto
2. Execute:
   ```bash
   npm run dev
   ```
3. Aguarde até aparecer: `Ready on http://localhost:3000`

### Passo 4.2: Testar Login

1. Abra o navegador em: http://localhost:3000
2. Clique em **"Login"** ou **"Começar Grátis"**
3. Clique em **"Continuar com Google"**
4. Faça login com sua conta Google
5. ✅ Deve redirecionar para `/dashboard`

### Passo 4.3: Testar GitHub (opcional)

1. Faça logout
2. Clique em **"Login"**
3. Clique em **"Continuar com GitHub"**
4. Autorize o app
5. ✅ Deve redirecionar para `/dashboard`

**Se funcionou localmente, pode prosseguir!** 🎉

---

## 🌐 PARTE 5: Configurar Domínio no Vercel

### Passo 5.1: Adicionar Domínio

1. Acesse: https://vercel.com/creatorhangars-projects/creator-hangar/settings/domains
2. No campo **"Domain"**, digite: `creatorhangar.com`
3. Clique em **"Add"**

### Passo 5.2: Escolher Ambiente

- **Connect to an environment:** Selecione **"Production"**
- Clique em **"Add"**

### Passo 5.3: Anotar Registros DNS

O Vercel vai mostrar os registros DNS necessários. Anote:

**Geralmente são:**
- **Registro A:** `76.76.21.21`
- **Registro CNAME:** `cname.vercel-dns.com`

---

## 🔧 PARTE 6: Configurar DNS na Hostinger

### Passo 6.1: Acessar DNS Zone

1. Acesse: https://hpanel.hostinger.com/domains
2. Encontre `creatorhangar.com`
3. Clique em **"Manage"** (Gerenciar)
4. No menu lateral, clique em **"DNS / Name Servers"**
5. Clique em **"Manage DNS Records"** ou **"DNS Zone"**

### Passo 6.2: Remover Registros Antigos

**IMPORTANTE:** Antes de adicionar novos, remova os conflitantes:

1. Procure por registros **A** com Name `@` ou vazio
2. Clique no ícone de **lixeira** para deletar
3. Procure por registros **CNAME** com Name `www`
4. Delete também

### Passo 6.3: Adicionar Registro A

1. Clique em **"Add Record"** ou **"+"**
2. Preencha:
   - **Type:** `A`
   - **Name:** `@` (ou deixe vazio)
   - **Points to / Value:** `76.76.21.21`
   - **TTL:** `3600` (ou deixe padrão)
3. Clique em **"Add"** ou **"Save"**

### Passo 6.4: Adicionar Registro CNAME

1. Clique em **"Add Record"** ou **"+"** novamente
2. Preencha:
   - **Type:** `CNAME`
   - **Name:** `www`
   - **Points to / Value:** `cname.vercel-dns.com`
   - **TTL:** `3600` (ou deixe padrão)
3. Clique em **"Add"** ou **"Save"**

### Passo 6.5: Salvar Alterações

1. Se houver um botão **"Save Changes"** ou **"Save All"**, clique
2. Aguarde a confirmação

---

## ⏰ PARTE 7: Aguardar Propagação DNS

### O que fazer:

1. Aguarde **10 a 30 minutos** (pode levar até 48h, mas geralmente é rápido)
2. Verifique no Vercel se o domínio foi validado:
   - Vá em: https://vercel.com/creatorhangars-projects/creator-hangar/settings/domains
   - Procure por `creatorhangar.com`
   - Aguarde até aparecer **✅ Valid**

### Como forçar verificação:

1. Clique nos **3 pontinhos** ao lado do domínio
2. Clique em **"Refresh"** ou **"Verify"**

### Como testar se propagou:

1. Abra uma **aba anônima** no navegador
2. Acesse: `https://creatorhangar.com`
3. Se carregar o site, propagou! ✅

---

## 🔄 PARTE 8: Atualizar URLs no Supabase

**⚠️ SÓ FAÇA DEPOIS QUE O DOMÍNIO ESTIVER FUNCIONANDO!**

### Passo 8.1: Atualizar Site URL

1. Acesse: https://supabase.com/dashboard/project/oqtmmzlfonhktxjnuilz/auth/url-configuration
2. **Site URL:** DELETE a URL antiga
3. Digite: `https://creatorhangar.com`
4. **NÃO salve ainda!**

### Passo 8.2: Atualizar Redirect URLs

1. **Redirect URLs:** DELETE todas as URLs antigas
2. Adicione estas 3 URLs (uma por linha):
   ```
   https://creatorhangar.com/login
   https://creatorhangar.com/dashboard
   https://creatorhangar.com/signup
   ```
3. Clique em **"Save"**

---

## 🔄 PARTE 9: Atualizar OAuth Redirect URIs

### Passo 9.1: Atualizar Google OAuth

1. Acesse: https://console.cloud.google.com/apis/credentials
2. Clique no seu OAuth client
3. Em **"Authorized JavaScript origins"**, adicione:
   - `https://creatorhangar.com`
4. Em **"Authorized redirect URIs"**, adicione:
   - `https://creatorhangar.com/auth/callback`
5. Clique em **"Save"**

### Passo 9.2: Atualizar GitHub OAuth

1. Acesse: https://github.com/settings/developers
2. Clique no seu OAuth app
3. **Homepage URL:** Atualize para `https://creatorhangar.com`
4. **Authorization callback URL:** Mantenha como está (Supabase callback)
5. Clique em **"Update application"**

---

## 🚀 PARTE 10: Deploy e Teste Final

### Passo 10.1: Fazer Deploy

1. Abra o terminal
2. Execute:
   ```bash
   git add .
   git commit -m "feat: OAuth authentication ready"
   git push
   ```
3. O Vercel vai fazer deploy automaticamente

### Passo 10.2: Testar em Produção

1. Abra uma **aba anônima**
2. Acesse: `https://creatorhangar.com`
3. Clique em **"Começar Grátis"**
4. Clique em **"Continuar com Google"**
5. Faça login
6. ✅ Deve redirecionar para `/dashboard`

### Passo 10.3: Testar Paywall

1. No dashboard, clique em **"Removedor de Fundo"**
2. Selecione imagens
3. Clique em **"Processar"**
4. ✅ Deve aparecer o cadeado pedindo upgrade

---

## ✅ Checklist Final

- [ ] Google OAuth configurado
- [ ] GitHub OAuth configurado
- [ ] OAuth ativado no Supabase
- [ ] Email provider desativado
- [ ] Testado localmente (funcionou)
- [ ] Domínio adicionado no Vercel
- [ ] DNS configurado na Hostinger
- [ ] Domínio verificado no Vercel (✅ Valid)
- [ ] Site URL atualizado no Supabase
- [ ] Redirect URLs atualizadas no Supabase
- [ ] OAuth redirect URIs atualizados
- [ ] Deploy realizado
- [ ] Testado em produção (funcionou)

---

## 🐛 Troubleshooting

### Erro: "redirect_uri_mismatch"

**Causa:** A URL de callback não está autorizada

**Solução:**
1. Verifique se adicionou EXATAMENTE: `https://oqtmmzlfonhktxjnuilz.supabase.co/auth/v1/callback`
2. Não pode ter espaços ou barras extras
3. Aguarde 5 minutos após salvar

### Erro: "Invalid login credentials"

**Causa:** Supabase não está configurado corretamente

**Solução:**
1. Verifique se ativou os provedores OAuth
2. Verifique se desativou o email provider
3. Aguarde 2-3 minutos após salvar
4. Limpe cookies e tente em aba anônima

### Domínio não verifica no Vercel

**Causa:** DNS ainda não propagou

**Solução:**
1. Aguarde mais 10-15 minutos
2. Limpe cache DNS: `ipconfig /flushdns` (Windows)
3. Teste em aba anônima
4. Verifique se os registros DNS estão corretos na Hostinger

### Login funciona local mas não em produção

**Causa:** URLs não atualizadas

**Solução:**
1. Verifique se atualizou Site URL no Supabase
2. Verifique se atualizou Redirect URLs no Supabase
3. Verifique se atualizou OAuth redirect URIs (Google/GitHub)
4. Aguarde 5 minutos e tente novamente

---

## 🎯 Próximos Passos

Depois que tudo funcionar:

1. **Analytics:** Adicionar Google Analytics
2. **Stripe:** Integrar pagamentos
3. **Mais Ferramentas:** Implementar as outras 12 ferramentas
4. **SEO:** Otimizar meta tags e sitemap

---

**Seu site estará no ar com OAuth funcionando!** 🚀

Siga os passos NA ORDEM e me avise se tiver alguma dúvida!
