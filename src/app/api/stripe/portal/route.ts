import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase-admin'; // Use admin for DB lookup if needed, but RLS on server client is better if policies allow. 
// However, since we need to look up a subscription by user_id, supabaseAdmin is reliable for server endpoints.

export async function POST(request: NextRequest) {
    try {
        const cookieStore = cookies();

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value
                    },
                },
            }
        )

        // 1. Verify Authentication
        const { data: { session }, error: authError } = await supabase.auth.getSession();

        if (authError || !session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userId = session.user.id;

        // 2. Fetch Customer ID from Database (Secure lookup)
        const { data: subscription, error: dbError } = await supabaseAdmin
            .from('subscriptions')
            .select('stripe_customer_id')
            .eq('user_id', userId)
            .single();

        if (dbError || !subscription || !subscription.stripe_customer_id) {
            return NextResponse.json(
                { error: 'No active subscription or customer found' },
                { status: 404 }
            );
        }

        // Create customer portal session
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: subscription.stripe_customer_id,
            return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
        });

        return NextResponse.json({ url: portalSession.url });
    } catch (error: any) {
        console.error('Portal error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
