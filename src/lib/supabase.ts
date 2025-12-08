// RE-EXPORT FOR BACKWARD COMPATIBILITY
// Prefer importing directly from '@/lib/supabase-client' or '@/lib/supabase-admin'

export { supabase } from './supabase-client';
// export { supabaseAdmin } from './supabase-admin'; // REMOVED: Import directly from '@/lib/supabase-admin' to avoid client-side bundling errors

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
          updated_at?: string;
        };
      };
    };
  };
};
