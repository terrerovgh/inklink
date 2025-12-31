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
            studio_id: z.string().optional(),
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

            // 3. Conditional Logic: Direct Booking vs Public Project
            if (input.studio_id) {
                // 3a. Create Payment Intent (Stripe)
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

                // 3b. Create Booking Request
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
            } else {
                // Public Project (Open Dossier)
                // Update status to 'open' if it was created as 'draft' (logic above set it to draft, we can update or set initially)
                // Actually, let's just creating it as 'open' if no studio_id, or update it here.
                // Re-updating for clarity or better yet, change the initial insert logic.
                // For minimally invasive change, let's update it.
                await supabase.from('dossiers').update({ status: 'open' } as any).eq('id', (dossier as any).id);

                return {
                    dossier: { ...dossier, status: 'open' },
                    booking: null,
                    clientSecret: null
                };
            }
        }
    }),
    createOffer: defineAction({
        accept: 'json',
        input: z.object({
            title: z.string(),
            description: z.string().optional(),
            price: z.number().optional(),
            discount_percentage: z.number().optional(),
            image_url: z.string().optional(),
            valid_until: z.string().optional()
        }),
        handler: async (input, context) => {
            const { data: { user } } = await supabase.auth.getUser(context.cookies.get('sb-access-token')?.value);
            if (!user) throw new Error("Unauthorized");

            // Verify user is artist (optional but good practice)
            // For now assume role check is done via RLS or UI, but let's just insert.
            // RLS 'Artists can manage own offers' ensures correctness if enforced, but strict role check here is better.

            const { data, error } = await supabase
                .from('offers')
                .insert({
                    artist_id: user.id,
                    title: input.title,
                    description: input.description,
                    price: input.price,
                    discount_percentage: input.discount_percentage,
                    image_url: input.image_url,
                    valid_until: input.valid_until
                } as any)
                .select()
                .single();

            if (error) throw new Error(error.message);
            return data;
        }
    }),
    inquireDossier: defineAction({
        accept: 'json',
        input: z.object({
            dossier_id: z.string(),
            message: z.string()
        }),
        handler: async (input, context) => {
            const { data: { user } } = await supabase.auth.getUser(context.cookies.get('sb-access-token')?.value);
            if (!user) throw new Error("Unauthorized");

            // 1. Get Dossier to find client_id
            const { data: dossier, error: dossierError } = await supabase
                .from('dossiers')
                .select('user_id')
                .eq('id', input.dossier_id)
                .single();

            if (dossierError || !dossier) throw new Error("Dossier not found");

            // 2. Create Booking (Inquiry)
            const { data: booking, error: bookingError } = await supabase
                .from('bookings')
                .insert({
                    dossier_id: input.dossier_id,
                    artist_id: user.id, // The one inquiring
                    client_id: (dossier as any).user_id,
                    status: 'inquiry'
                } as any)
                .select()
                .single();

            if (bookingError) throw new Error(bookingError.message);

            // 3. Create Message
            if (input.message) {
                await supabase.from('messages').insert({
                    booking_id: (booking as any).id,
                    sender_id: user.id,
                    content: input.message
                } as any);
            }

            return booking;
        }
    }),
    createFlash: defineAction({
        accept: 'json',
        input: z.object({
            title: z.string(),
            description: z.string().optional(),
            price: z.number().optional(),
            image_url: z.string().url(),
            is_available: z.boolean().optional().default(true)
        }),
        handler: async (input, context) => {
            const { data: { user } } = await supabase.auth.getUser(context.cookies.get('sb-access-token')?.value);
            if (!user) throw new Error("Unauthorized");

            const { data, error } = await supabase
                .from('flash_tattoos')
                .insert({
                    artist_id: user.id,
                    title: input.title,
                    description: input.description,
                    price: input.price,
                    image_url: input.image_url,
                    is_available: input.is_available
                } as any)
                .select()
                .single();

            if (error) throw new Error(error.message);
            return data;
        }
    }),
    updateProfile: defineAction({
        accept: 'json',
        input: z.object({
            full_name: z.string().min(1, "Name is required"),
            username: z.string().min(3, "Username must be at least 3 characters").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and underscores"),
            bio: z.string().max(500, "Bio too long").optional(),
            avatar_url: z.string().url("Invalid avatar URL").optional().or(z.literal("")),
        }),
        handler: async (input, context) => {
            const { data: { user } } = await supabase.auth.getUser(context.cookies.get('sb-access-token')?.value);
            if (!user) throw new Error("Unauthorized");

            const { data, error } = await (supabase
                .from('profiles') as any)
                .update({
                    full_name: input.full_name,
                    username: input.username,
                    bio: input.bio,
                    avatar_url: input.avatar_url || null,
                    updated_at: new Date().toISOString()
                } as any)
                .eq('id', user.id)
                .select()
                .single();

            if (error) {
                console.error("Profile Update Error:", error);
                throw new Error(error.message);
            }

            return data;
        }
    }),
    adminUpdateUserRole: defineAction({
        accept: 'json',
        input: z.object({
            user_id: z.string(),
            role: z.enum(['user', 'artist', 'studio_owner', 'admin'])
        }),
        handler: async (input, context) => {
            const { data: { user } } = await supabase.auth.getUser(context.cookies.get('sb-access-token')?.value);
            if (!user) throw new Error("Unauthorized");

            const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
            if ((profile as any)?.role !== 'admin') throw new Error("Unauthorized: Admin only");

            const { data, error } = await supabase
                .from('profiles')
                .update({ role: input.role } as any)
                .eq('id', input.user_id)
                .select()
                .single();

            if (error) throw new Error(error.message);
            return data;
        }
    }),
    adminDeleteUser: defineAction({
        accept: 'json',
        input: z.object({
            user_id: z.string()
        }),
        handler: async (input, context) => {
            const { data: { user } } = await supabase.auth.getUser(context.cookies.get('sb-access-token')?.value);
            if (!user) throw new Error("Unauthorized");

            const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
            if ((profile as any)?.role !== 'admin') throw new Error("Unauthorized: Admin only");

            const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', input.user_id);

            if (error) throw new Error(error.message);
            return { success: true };
        }
    }),
    adminToggleStudioPremium: defineAction({
        accept: 'json',
        input: z.object({
            studio_id: z.string(),
            is_premium: z.boolean()
        }),
        handler: async (input, context) => {
            const { data: { user } } = await supabase.auth.getUser(context.cookies.get('sb-access-token')?.value);
            if (!user) throw new Error("Unauthorized");

            const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
            if ((profile as any)?.role !== 'admin') throw new Error("Unauthorized: Admin only");

            const { data, error } = await supabase
                .from('studios')
                .update({ is_premium: input.is_premium } as any)
                .eq('id', input.studio_id)
                .select()
                .single();

            if (error) throw new Error(error.message);
            return data;
        }
    }),
    adminDeleteContent: defineAction({
        accept: 'json',
        input: z.object({
            id: z.string(),
            type: z.enum(['flash', 'dossier', 'offer'])
        }),
        handler: async (input, context) => {
            const { data: { user } } = await supabase.auth.getUser(context.cookies.get('sb-access-token')?.value);
            if (!user) throw new Error("Unauthorized");

            const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
            if ((profile as any)?.role !== 'admin') throw new Error("Unauthorized: Admin only");

            const table = input.type === 'flash' ? 'flash_tattoos' : input.type === 'dossier' ? 'dossiers' : 'offers';

            const { error } = await supabase
                .from(table)
                .delete()
                .eq('id', input.id);

            if (error) throw new Error(error.message);
            return { success: true };
        }
    }),
    adminCancelBooking: defineAction({
        accept: 'json',
        input: z.object({
            booking_id: z.string()
        }),
        handler: async (input, context) => {
            const { data: { user } } = await supabase.auth.getUser(context.cookies.get('sb-access-token')?.value);
            if (!user) throw new Error("Unauthorized");

            const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
            if ((profile as any)?.role !== 'admin') throw new Error("Unauthorized: Admin only");

            const { error } = await supabase
                .from('bookings')
                .update({ status: 'cancelled' } as any)
                .eq('id', input.booking_id);

            if (error) throw new Error(error.message);
            return { success: true };
        }
    })
};
