import Stripe from 'stripe';

const STRIPE_SECRET_KEY = import.meta.env.STRIPE_SECRET_KEY || 'sk_test_placeholder'; // Fallback for dev

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2025-12-15.clover' as any, // Cast to any to suppress if multiple versions conflict or just use string
    typescript: true,
});
