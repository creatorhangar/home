import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getPriceId, BillingPeriod, Currency } from '@/lib/stripe-prices';
import { getCurrencyFromRequest } from '@/lib/currency-detection';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const { userId, email, period, planType } = await request.json() as {
            userId: string;
            email: string;
            period: BillingPeriod;
            planType: 'pro' | 'enterprise';
        };

        if (!userId || !email || !period) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Detect user's currency
        const currency = await getCurrencyFromRequest(request);

        // Get the appropriate price ID
        const priceId = getPriceId(currency, period);

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            customer_email: email,
            client_reference_id: userId,
            payment_method_types: ['card'],
            mode: 'subscription',
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cancel`,
            metadata: {
                userId,
                currency,
                period,
            },
        });

        return NextResponse.json({ sessionId: session.id, url: session.url });
    } catch (error: any) {
        console.error('Checkout error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
