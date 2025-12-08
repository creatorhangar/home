import Stripe from 'stripe';

const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
    console.warn('WARNING: STRIPE_SECRET_KEY is missing. Stripe functionality will fail.');
}

export const stripe = new Stripe(stripeKey || '', {
    apiVersion: '2025-11-17.clover',
    typescript: true,
});
