import { createBrowserClient } from '@supabase/ssr';

// Client-side (para componentes)
// Usa apenas chaves públicas (NEXT_PUBLIC_)
export const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
