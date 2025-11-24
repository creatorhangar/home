import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

// TEMPORARY HARDCODED VALUES - Next.js 16 Turbopack bug workaround
// TODO: Fix environment variables loading issue
const SUPABASE_URL = 'https://oqtmmzlfornqkqwwdqnz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xdG1temxmb3JucWtxd3dkcW56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI0MjkxMDksImV4cCI6MjA0ODAwNTEwOX0.yDEwKCx5ygGMpUHxTCLYJPQZvjnI7Ot8vBKZqxPmLJo';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xdG1temxmb3JucWtxd3dkcW56Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjQyOTEwOSwiZXhwIjoyMDQ4MDA1MTA5fQ.xZJlQGPnbRqVqQqxPmLJoKCx5ygGMpUHxTCLYJPQZvjnI7Ot8vBKZqxPmLJo';

// Client-side (para componentes)
export const supabase = createBrowserClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// Server-side (para API routes)
export const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Types
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          stripe_price_id: string | null;
          plan_type: 'free' | 'pro' | 'enterprise';
          status: string;
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          trial_end: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      usage_tracking: {
        Row: {
          id: string;
          user_id: string;
          tool_name: string;
          action_type: string;
          usage_date: string;
          usage_count: number;
          created_at: string;
        };
      };
    };
  };
};
