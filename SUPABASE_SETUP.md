# Configuração do Supabase - Creative Hangar

## Passo 1: Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Crie uma organização (se ainda não tiver)
4. Clique em "New Project"
5. Preencha:
   - **Name**: creative-hangar
   - **Database Password**: (crie uma senha forte e GUARDE!)
   - **Region**: South America (São Paulo)
   - **Pricing Plan**: Free (por enquanto)

## Passo 2: Copiar Credenciais

Após o projeto ser criado (leva ~2 minutos):

1. Vá em **Settings** → **API**
2. Copie os seguintes valores:

```
Project URL: https://xxxxx.supabase.co
anon public: eyJhbGc...
service_role: eyJhbGc... (clique em "Reveal" para ver)
```

3. Cole no arquivo `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

## Passo 3: Executar SQL

1. No Supabase, vá em **SQL Editor**
2. Clique em "New Query"
3. Cole o SQL abaixo e clique em "Run"

```sql
-- Tabela de perfis (extends auth.users)
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
  plan_type TEXT DEFAULT 'free', -- 'free', 'pro', 'enterprise'
  status TEXT DEFAULT 'active', -- 'active', 'canceled', 'past_due', 'trialing'
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  trial_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de uso (para limites do plano grátis)
CREATE TABLE public.usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  tool_name TEXT NOT NULL,
  action_type TEXT NOT NULL, -- 'process', 'export', 'generate'
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
  
  -- Criar subscription grátis
  INSERT INTO public.subscriptions (user_id, plan_type, status)
  VALUES (NEW.id, 'free', 'active');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Passo 4: Configurar Email Templates (Opcional)

1. Vá em **Authentication** → **Email Templates**
2. Personalize os templates de:
   - Confirm signup
   - Magic Link
   - Change Email Address
   - Reset Password

## Passo 5: Testar

Reinicie o servidor Next.js:

```bash
npm run dev
```

Acesse: `http://localhost:3000/tools/removedor-fundo`

Você deve ver o "cadeado" aparecendo quando tentar processar imagens!

## Próximos Passos

Depois de configurar o Supabase, você pode:
1. Criar páginas de login/signup
2. Adicionar mais ferramentas
3. Configurar Stripe para pagamentos
