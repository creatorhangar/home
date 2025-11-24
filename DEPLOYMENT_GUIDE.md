# 🚀 Guia Definitivo - Deploy Creative Hangar
**Atualizado: 24/11/2024**

## ✅ Status Atual

- ✅ Código no GitHub: `https://github.com/creatorhangar/home`
- ✅ Deploy no Vercel: `creatorhangars-projects/creator-hangar`
- ✅ URL temporária: `https://creator-hangar-2y56pp3l6-creatorhangars-projects.vercel.app`
- ✅ Supabase configurado: Projeto `oqtmmzlfonhktxjnuilz`
- 🔄 Domínio: `creatorhangar.com` (a configurar)

---

## 📋 PARTE 1: Configurar Domínio no Vercel

### Passo 1.1: Adicionar Domínio

1. Acesse: https://vercel.com/creatorhangars-projects/creator-hangar/settings/domains
2. Clique em **"Add Domain"**
3. Digite: `creatorhangar.com`
4. Clique em **"Add"**

### Passo 1.2: Escolher Ambiente

Quando perguntar "Connect to an environment":
- ✅ Selecione: **"Production"**
- ❌ NÃO selecione "Preview"

### Passo 1.3: Anotar Registros DNS

O Vercel vai mostrar os registros DNS necessários. Geralmente são:

**Registro A (para o domínio raiz):**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600
```

**Registro CNAME (para www):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

---

## 📋 PARTE 2: Configurar DNS na Hostinger

### Passo 2.1: Acessar Painel

1. Vá em: https://hpanel.hostinger.com/domains
2. Encontre `creatorhangar.com`
3. Clique em **"Manage"** (Gerenciar)

### Passo 2.2: Acessar DNS

1. Procure por **"DNS / Name Servers"** ou **"DNS Zone"**
2. Clique em **"Manage DNS Records"** ou **"Edit DNS Zone"**

### Passo 2.3: Adicionar Registros

**IMPORTANTE:** Se já existirem registros A ou CNAME com os mesmos nomes, DELETE-OS primeiro.

**Adicione o Registro A:**
1. Clique em **"Add Record"** ou **"+"**
2. Type: `A`
3. Name: `@` (ou deixe vazio se pedir)
4. Points to / Value: `76.76.21.21`
5. TTL: `3600` (ou deixe padrão)
6. Clique em **"Save"** ou **"Add"**

**Adicione o Registro CNAME:**
1. Clique em **"Add Record"** ou **"+"**
2. Type: `CNAME`
3. Name: `www`
4. Points to / Value: `cname.vercel-dns.com`
5. TTL: `3600` (ou deixe padrão)
6. Clique em **"Save"** ou **"Add"**

### Passo 2.4: Salvar Alterações

1. Clique em **"Save Changes"** ou **"Save All"**
2. Aguarde a confirmação

---

## 📋 PARTE 3: Verificar no Vercel

### Passo 3.1: Aguardar Propagação

- Tempo mínimo: 5 minutos
- Tempo máximo: 48 horas (geralmente 10-30 minutos)

### Passo 3.2: Verificar Status

1. Volte em: https://vercel.com/creatorhangars-projects/creator-hangar/settings/domains
2. Procure por `creatorhangar.com`
3. Aguarde até aparecer um **✅ verde** ou status "Valid"

### Passo 3.3: Forçar Verificação (se demorar)

1. Clique nos **3 pontinhos** ao lado do domínio
2. Clique em **"Refresh"** ou **"Verify"**

---

## 📋 PARTE 4: Configurar Supabase

**⚠️ IMPORTANTE:** Só faça isso DEPOIS que o domínio estiver funcionando (✅ verde no Vercel)

### Passo 4.1: Acessar Configurações

1. Vá em: https://supabase.com/dashboard/project/oqtmmzlfonhktxjnuilz/auth/url-configuration

### Passo 4.2: Configurar Site URL

1. Encontre o campo **"Site URL"**
2. **DELETE** qualquer URL antiga
3. Digite: `https://creatorhangar.com`
4. **NÃO clique em Save ainda**

### Passo 4.3: Configurar Redirect URLs

1. Encontre o campo **"Redirect URLs"**
2. **DELETE** todas as URLs antigas
3. Adicione estas 3 URLs (uma por linha):
   ```
   https://creatorhangar.com/login
   https://creatorhangar.com/dashboard
   https://creatorhangar.com/signup
   ```

### Passo 4.4: Salvar

1. Clique em **"Save"**
2. Aguarde a confirmação

---

## 📋 PARTE 5: Testar o Site

### Teste 1: Acessar o Domínio

1. Abra uma **aba anônima** no navegador (Ctrl+Shift+N)
2. Acesse: `https://creatorhangar.com`
3. ✅ O site deve carregar normalmente

### Teste 2: Criar Conta

1. Clique em **"Começar Grátis"** ou **"Signup"**
2. Preencha:
   - Nome: Seu Nome
   - Email: teste@exemplo.com
   - Senha: 123456
3. Clique em **"Criar Conta"**
4. ✅ Deve redirecionar para `/dashboard`

### Teste 3: Testar Paywall

1. No dashboard, clique em **"Removedor de Fundo"**
2. Selecione algumas imagens
3. Clique em **"Processar"**
4. ✅ Deve aparecer o cadeado roxo pedindo upgrade

### Teste 4: Logout e Login

1. Clique em **"Sair"**
2. Clique em **"Login"**
3. Entre com o email/senha que criou
4. ✅ Deve fazer login e ir para dashboard

---

## 🐛 Troubleshooting

### Problema: Domínio não verifica no Vercel

**Solução:**
1. Verifique se os registros DNS estão EXATAMENTE como o Vercel pediu
2. Aguarde mais 10-15 minutos
3. Limpe o cache DNS do seu computador:
   ```powershell
   ipconfig /flushdns
   ```
4. Tente acessar em modo anônimo

### Problema: "Invalid login credentials" ao criar conta

**Solução:**
1. Verifique se configurou as URLs corretas no Supabase
2. Aguarde 2-3 minutos após salvar no Supabase
3. Limpe cookies do navegador
4. Tente em aba anônima

### Problema: Site carrega mas login não funciona

**Solução:**
1. Verifique se as Redirect URLs no Supabase estão corretas
2. Certifique-se de que NÃO tem URLs antigas lá
3. Abra o Console do navegador (F12) e veja se há erros
4. Se houver erro de CORS, aguarde mais alguns minutos

### Problema: www.creatorhangar.com não funciona

**Solução:**
1. Verifique se adicionou o registro CNAME para `www`
2. No Vercel, adicione `www.creatorhangar.com` como domínio também
3. Configure para redirecionar para `creatorhangar.com`

---

## ✅ Checklist Final

- [ ] Domínio adicionado no Vercel (Production)
- [ ] Registros DNS adicionados na Hostinger
- [ ] Domínio verificado no Vercel (✅ verde)
- [ ] Site URL configurado no Supabase
- [ ] Redirect URLs configuradas no Supabase
- [ ] Site carrega em `https://creatorhangar.com`
- [ ] Cadastro funciona
- [ ] Login funciona
- [ ] Dashboard carrega
- [ ] Paywall funciona

---

## 🎯 Próximos Passos (Depois que tudo funcionar)

1. **Stripe Integration**
   - Criar conta no Stripe
   - Configurar produtos (Free, Pro, Enterprise)
   - Implementar checkout
   - Configurar webhooks

2. **Mais Ferramentas**
   - Implementar as outras 12 ferramentas
   - Aplicar ActionWrapper em cada uma

3. **Analytics**
   - Google Analytics
   - Vercel Analytics
   - Supabase Analytics

4. **SEO**
   - Adicionar meta tags
   - Configurar sitemap
   - Google Search Console

---

## 📞 Suporte

Se algo não funcionar:
1. Tire um print da tela do erro
2. Abra o Console do navegador (F12) e copie os erros
3. Me envie as informações

---

**Seu site está quase no ar!** 🚀

Siga os passos na ordem e me avise quando completar cada parte!
