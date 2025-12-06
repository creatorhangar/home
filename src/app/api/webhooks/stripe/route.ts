import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
        return NextResponse.json(
            { error: 'No signature' },
            { status: 400 }
        );
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return NextResponse.json(
            { error: `Webhook Error: ${err.message}` },
            { status: 400 }
        );
    }

    // Handle the event
    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                await handleCheckoutCompleted(session);
                break;
            }

            case 'customer.subscription.created':
            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionUpdate(subscription);
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionDeleted(subscription);
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error('Webhook handler error:', error);
        return NextResponse.json(
            { error: 'Webhook handler failed' },
            { status: 500 }
        );
    }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const userId = session.client_reference_id || session.metadata?.userId;

    if (!userId) {
        console.error('No user ID in checkout session');
        return;
    }

    // Get the subscription
    const subscriptionId = session.subscription as string;
    // @ts-ignore - Stripe types are inconsistent between versions
    const subscription: any = await stripe.subscriptions.retrieve(subscriptionId);

    // Update user's subscription in Supabase
    const { error } = await supabaseAdmin
        .from('subscriptions')
        .update({
            plan_type: 'pro',
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: subscriptionId,
            stripe_price_id: subscription.items.data[0].price.id,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        })
        .eq('user_id', userId);

    if (error) {
        console.error('Error updating subscription:', error);
    } else {
        console.log(`Subscription activated for user ${userId}`);
    }
}

async function handleSubscriptionUpdate(subscription: any) {
    const customerId = subscription.customer as string;

    // Find user by customer ID
    const { data: subscriptionData, error: findError } = await supabaseAdmin
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_customer_id', customerId)
        .single();

    if (findError || !subscriptionData) {
        console.error('Could not find subscription for customer:', customerId);
        return;
    }

    // Update subscription
    const { error } = await supabaseAdmin
        .from('subscriptions')
        .update({
            stripe_subscription_id: subscription.id,
            stripe_price_id: subscription.items.data[0].price.id,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        })
        .eq('user_id', subscriptionData.user_id);

    if (error) {
        console.error('Error updating subscription:', error);
    } else {
        console.log(`Subscription updated for user ${subscriptionData.user_id}`);
    }
}

async function handleSubscriptionDeleted(subscription: any) {
    const customerId = subscription.customer as string;

    // Find user by customer ID
    const { data: subscriptionData, error: findError } = await supabaseAdmin
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_customer_id', customerId)
        .single();

    if (findError || !subscriptionData) {
        console.error('Could not find subscription for customer:', customerId);
        return;
    }

    // Downgrade to free
    const { error } = await supabaseAdmin
        .from('subscriptions')
        .update({
            plan_type: 'free',
            status: 'canceled',
            stripe_subscription_id: null,
            stripe_price_id: null,
        })
        .eq('user_id', subscriptionData.user_id);

    if (error) {
        console.error('Error canceling subscription:', error);
    } else {
        console.log(`Subscription canceled for user ${subscriptionData.user_id}`);
    }
}
