import { defineAction } from 'astro:actions';
import { z } from 'astro/zod';
import { supabase } from '../lib/supabase';
import { stripe } from '../lib/stripe';

export const server = {
    createDossier: defineAction({
        accept: 'json',
        input: z.object({
            title: z.string(),
            description: z.string(),
            body_zone: z.string(),
            budget_min: z.number(),
            budget_max: z.number(),
            studio_id: z.string(),
            concept_images: z.array(z.string()).optional(),
            booking_date: z.string().optional() // Make it optional for backwards compatibility or if user skips
        }),
        handler: async (input, context) => {
            // 1. Auth Check
            const { data: { user } } = await supabase.auth.getUser(context.cookies.get('sb-access-token')?.value);

            if (!user) {
                throw new Error("Unauthorized");
            }

            // 2. Insert Dossier
            const { data: dossier, error: dossierError } = await supabase
                .from('dossiers')
                .insert({
                    title: input.title,
                    description: input.description,
                    body_zone: input.body_zone,
                    budget_min: input.budget_min,
                    budget_max: input.budget_max,
                    start_date: null,
                    end_date: null,
                    status: 'draft',
                    client_id: user.id,
                    studio_id: input.studio_id,
                    concept_images: input.concept_images || [],
                    size_cm: null
                } as any)
                .select()
                .single();

            if (dossierError) {
                console.error("Dossier Error:", dossierError);
                throw new Error("Failed to create dossier");
            }

            // 3. Create Payment Intent (Stripe)
            const depositAmount = 5000;

            let paymentIntent;
            try {
                paymentIntent = await stripe.paymentIntents.create({
                    amount: depositAmount,
                    currency: 'usd',
                    metadata: {
                        booking_id: 'pending_creation',
                        dossier_id: (dossier as any).id,
                        studio_id: input.studio_id
                    },
                    automatic_payment_methods: {
                        enabled: true,
                    },
                });
            } catch (stripeError) {
                console.error("Stripe Error:", stripeError);
            }

            // 4. Create Booking Request
            const { data: booking, error: bookingError } = await supabase
                .from('bookings')
                .insert({
                    dossier_id: (dossier as any).id,
                    client_id: user.id,
                    studio_id: input.studio_id,
                    status: 'pending',
                    deposit_amount: depositAmount,
                    stripe_payment_intent: paymentIntent?.id,
                    date: input.booking_date // Add selected date
                } as any)
                .select()
                .single();

            if (bookingError) {
                console.error("Booking Error:", bookingError);
                throw new Error("Failed to create booking");
            }

            return {
                dossier,
                booking,
                clientSecret: paymentIntent?.client_secret
            };
        }
    }),
};
