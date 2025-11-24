# 🚀 Deploy Rápido - Vercel

## ✅ Você já tem:
- Projeto criado no Vercel: `sitecreatorhangar`
- Supabase configurado
- Build de produção funcionando

---

## 🎯 PASSO 1: Configurar Variáveis de Ambiente

**Onde:** Vercel Dashboard → Seu Projeto → Settings → Environment Variables

**Adicione estas 3 variáveis:**

1. **Nome:** `NEXT_PUBLIC_SUPABASE_URL`
   **Valor:** `https://oqtmmzlfornqkqwwdqnz.supabase.co`

2. **Nome:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   **Valor:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xdG1temxmb3JucWtxd3dkcW56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI0MjkxMDksImV4cCI6MjA0ODAwNTEwOX0.yDEwKCx5ygGMpUHxTCLYJPQZvjnI7Ot8vBKZqxPmLJo`

3. **Nome:** `SUPABASE_SERVICE_ROLE_KEY`
   **Valor:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xdG1temxmb3JucWtxd3dkcW56Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjQyOTEwOSwiZXhwIjoyMDQ4MDA1MTA5fQ.xZJlQGPnbRqVqQqxPmLJoKCx5ygGMpUHxTCLYJPQZvjnI7Ot8vBKZqxPmLJo`

**Importante:** Marque as 3 checkboxes: Production, Preview, Development

Clique em **Save**

---

## 🎯 PASSO 2: Fazer Deploy

**Onde:** Vercel Dashboard → Deployments → Redeploy

1. Clique no botão **"Redeploy"** (ícone de refresh)
2. Confirme "Redeploy to Production"
3. Aguarde 2-3 minutos

✅ Quando terminar, você terá uma URL tipo: `https://sitecreatorhangar.vercel.app`

---

## 🎯 PASSO 3: Configurar Supabase

**Onde:** Supabase Dashboard → Authentication → URL Configuration

### 3.1 Site URL
Cole a URL do Vercel:
```
https://sitecreatorhangar.vercel.app
```

### 3.2 Redirect URLs
Adicione estas 3 URLs (uma por linha):
```
https://sitecreatorhangar.vercel.app/login
https://sitecreatorhangar.vercel.app/dashboard
https://sitecreatorhangar.vercel.app/signup
```

Clique em **Save**

---

## 🧪 PASSO 4: Testar em Produção

### Teste 1: Acessar o Site
1. Abra: `https://sitecreatorhangar.vercel.app`
2. ✅ Landing page deve carregar

### Teste 2: Criar Conta
1. Clique em "Começar Grátis" (navbar)
2. Preencha: nome, email, senha
3. ✅ Deve criar conta e ir para dashboard

### Teste 3: Testar Paywall
1. No dashboard, clique em "Removedor de Fundo"
2. Selecione imagens
3. Clique em "Processar"
4. ✅ Cadeado roxo deve aparecer com "Upgrade para Pro"

### Teste 4: Logout e Login
1. Clique em "Sair"
2. Faça login novamente
3. ✅ Deve funcionar

---

## 🐛 Se Der Erro

### "Missing Supabase environment variables"
- Volte no Passo 1
- Verifique se as 3 variáveis estão salvas
- Faça redeploy

### "Invalid login credentials"
- Volte no Passo 3
- Verifique se as URLs estão corretas no Supabase
- Aguarde 1 minuto e tente novamente

### Página em branco
- Abra o console do navegador (F12)
- Me mostre o erro

---

## ✅ Checklist

- [ ] Variáveis de ambiente adicionadas no Vercel
- [ ] Redeploy feito
- [ ] URLs configuradas no Supabase
- [ ] Landing page carrega
- [ ] Cadastro funciona
- [ ] Login funciona
- [ ] Dashboard mostra dados
- [ ] Paywall funciona

---

## 🎯 Próximos Passos (Depois que funcionar)

1. **Domínio Customizado** (Opcional)
   - Vercel → Settings → Domains
   - Adicionar seu domínio

2. **Stripe** (Para pagamentos)
   - Criar conta no Stripe
   - Configurar produtos
   - Integrar checkout

3. **Mais Ferramentas**
   - Criar as outras 12 ferramentas
   - Aplicar ActionWrapper

---

**Seu app está indo para o ar!** 🚀

URL: `https://sitecreatorhangar.vercel.app`
