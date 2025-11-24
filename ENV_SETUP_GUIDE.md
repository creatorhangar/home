# 🚨 CORREÇÃO: Como Configurar o .env.local

## ❌ O QUE VOCÊ FEZ (ERRADO)

Você colou isto no **SQL Editor do Supabase**:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

**ISSO ESTÁ ERRADO!** Essas variáveis NÃO vão no Supabase!

---

## ✅ O QUE FAZER (CORRETO)

### Passo 1: Criar arquivo `.env.local` no VS Code

1. Abra o VS Code
2. Na pasta raiz do projeto `creator-hangar`, clique com botão direito
3. Selecione "New File"
4. Nome do arquivo: `.env.local` (COM O PONTO NA FRENTE!)

**Estrutura de pastas:**
```
creator-hangar/
├── src/
├── public/
├── package.json
├── .env.local  ← CRIE ESTE ARQUIVO AQUI!
└── SUPABASE_SETUP.md
```

### Passo 2: Pegar credenciais no Supabase

No Supabase Dashboard:

1. Clique em **Settings** (ícone de engrenagem no canto inferior esquerdo)
2. Clique em **API**
3. Você verá:

```
Project URL
https://xxxxxxxxxxxxx.supabase.co
[Copy]

Project API keys
anon public
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
[Copy]

service_role
[Reveal] [Copy]
```

### Passo 3: Colar no arquivo `.env.local`

Cole isto no arquivo `.env.local` que você criou:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**SUBSTITUA** os valores `xxxxx` e `eyJhbG...` pelas suas credenciais reais!

### Passo 4: Salvar e reiniciar

1. Salve o arquivo `.env.local` (Ctrl+S)
2. No terminal, pare o servidor (Ctrl+C)
3. Inicie novamente: `npm run dev`

---

## 📝 O QUE EXECUTAR NO SQL EDITOR DO SUPABASE

No **SQL Editor** do Supabase, execute APENAS este SQL:

```sql
-- Tabela de perfis
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de assinaturas
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  plan_type TEXT DEFAULT 'free',
  status TEXT DEFAULT 'active',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  trial_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de uso
CREATE TABLE public.usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  tool_name TEXT NOT NULL,
  action_type TEXT NOT NULL,
  usage_date DATE DEFAULT CURRENT_DATE,
  usage_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, tool_name, action_type, usage_date)
);

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- Policies para profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policies para subscriptions
CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Policies para usage_tracking
CREATE POLICY "Users can view own usage" ON public.usage_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage" ON public.usage_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trigger para criar profile automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
  INSERT INTO public.subscriptions (user_id, plan_type, status)
  VALUES (NEW.id, 'free', 'active');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## ✅ Como verificar se está funcionando

Depois de criar o `.env.local` e reiniciar o servidor:

1. Acesse: `http://localhost:3000/tools/removedor-fundo`
2. Você deve ver a página da ferramenta
3. O botão "Processar" deve mostrar o cadeado 🔒

Se aparecer erro de "SUPABASE_URL is not defined", significa que o `.env.local` não foi criado corretamente.

---

## 🆘 Ainda com dúvida?

Me avise e eu te ajudo! Mas lembre-se:

- ❌ `.env.local` NÃO vai no Supabase
- ✅ `.env.local` fica no seu computador, na raiz do projeto
- ❌ Variáveis de ambiente NÃO são SQL
- ✅ SQL vai no SQL Editor do Supabase
