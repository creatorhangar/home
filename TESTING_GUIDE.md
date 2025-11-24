# 🧪 Guia de Teste - Sistema de Autenticação

## ✅ O que foi criado

1. **Página de Login** (`/login`)
   - Email + senha
   - Validação de erros
   - Link para signup
   - Redirecionamento para dashboard

2. **Página de Signup** (`/signup`)
   - Nome completo + email + senha + confirmar senha
   - Validação (senha mínimo 6 caracteres, senhas devem coincidir)
   - Tela de sucesso animada
   - Redirecionamento automático para dashboard

3. **Dashboard** (`/dashboard`)
   - Mostra nome do usuário
   - Card do plano atual (Free/Pro)
   - Estatísticas de uso
   - Grid de ferramentas disponíveis
   - Botão de logout
   - CTA para upgrade (se Free)

4. **Navbar Atualizada**
   - Mostra "Login" e "Começar Grátis" quando deslogado
   - Mostra "Dashboard" e "Sair" quando logado
   - Responsivo (mobile menu)

---

## 🧪 Como Testar

### Teste 1: Criar uma Conta Nova

1. Acesse: `http://localhost:3000/signup`
2. Preencha:
   - **Nome**: Seu Nome
   - **Email**: teste@exemplo.com
   - **Senha**: 123456
   - **Confirmar Senha**: 123456
3. Clique em "Criar Conta Grátis"
4. **Resultado esperado**:
   - ✅ Tela de sucesso verde aparece
   - ✅ Mensagem "Conta criada com sucesso!"
   - ✅ Redirecionamento automático para `/dashboard` em 2 segundos

### Teste 2: Ver o Dashboard

1. Após criar conta, você deve estar em `/dashboard`
2. **Verifique**:
   - ✅ Seu nome aparece no topo ("Olá, [Seu Nome]!")
   - ✅ Card mostra "Plano Atual: Grátis"
   - ✅ Estatísticas mostram "3 ferramentas" e "0 / 5 edições"
   - ✅ Botão "Fazer Upgrade para Pro" aparece
   - ✅ Card "Removedor de Fundo" tem badge "Requer Pro"

### Teste 3: Testar o Cadeado

1. No dashboard, clique em "Removedor de Fundo"
2. Você vai para `/tools/removedor-fundo`
3. Selecione algumas imagens
4. Clique em "Processar X Imagens"
5. **Resultado esperado**:
   - ✅ Cadeado roxo aparece
   - ✅ Mensagem "Recurso Pro"
   - ✅ Botão "Ver Planos Pro"

### Teste 4: Logout e Login

1. No dashboard, clique em "Sair" (canto superior direito)
2. Você volta para a home (`/`)
3. Navbar agora mostra "Login" e "Começar Grátis"
4. Clique em "Login"
5. Entre com:
   - **Email**: teste@exemplo.com
   - **Senha**: 123456
6. **Resultado esperado**:
   - ✅ Login bem-sucedido
   - ✅ Redirecionamento para `/dashboard`
   - ✅ Navbar mostra "Dashboard" e "Sair"

### Teste 5: Navbar Responsivo

1. Diminua a janela do navegador (mobile)
2. **Verifique**:
   - ✅ Menu hambúrguer aparece
   - ✅ Ao clicar, menu mobile abre
   - ✅ Links funcionam
   - ✅ Botões de auth aparecem corretamente

---

## 🐛 Possíveis Erros e Soluções

### Erro: "Email already registered"
**Solução**: Use outro email ou vá no Supabase → Authentication → Users e delete o usuário de teste

### Erro: "Invalid login credentials"
**Solução**: Verifique se o email/senha estão corretos. Caso tenha esquecido, crie uma nova conta.

### Erro: Página em branco
**Solução**: Verifique o console do navegador (F12) e me mostre o erro

### Erro: "Missing Supabase environment variables"
**Solução**: Já resolvido com hardcode. Ignore se aparecer no console do servidor.

---

## 📊 Verificar no Supabase

Após criar uma conta, vá no Supabase Dashboard:

1. **Authentication** → **Users**
   - ✅ Deve aparecer seu usuário
   - ✅ Email confirmado (ou pending se configurou email verification)

2. **Table Editor** → **profiles**
   - ✅ Deve ter 1 linha com seu ID, email e nome

3. **Table Editor** → **subscriptions**
   - ✅ Deve ter 1 linha com:
     - `user_id`: seu ID
     - `plan_type`: "free"
     - `status`: "active"

---

## 🎯 Próximos Passos

Depois de testar tudo:

1. ✅ **Se tudo funcionar**: Vou criar mais 2-3 ferramentas como exemplo
2. ✅ **Depois**: Integração com Stripe para pagamentos
3. ✅ **Por último**: Deploy em produção

---

**Me avise quando testar e me diga:**
- ✅ O que funcionou
- ❌ O que deu erro (se houver)
- 💡 O que quer que eu faça a seguir
