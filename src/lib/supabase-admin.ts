import { createClient } from '@supabase/supabase-js';

// Server-side (para API routes)
// Usa a chave secreta (SERVICE_ROLE_KEY)
// NUNCA importe isso em componentes de cliente (use 'use client')
export const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);
