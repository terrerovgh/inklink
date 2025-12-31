import React, { useState } from 'react';
import { actions } from 'astro:actions';
import { X, Upload, ChevronRight, Check } from 'lucide-react';
import { cn } from '../../../lib/utils'; // Assuming this exists or will exist
import ImageUpload from '../../ui/ImageUpload';
import { supabase } from '../../../lib/supabase';

// Helper to upload images
async function uploadImages(files: File[], userId: string): Promise<string[]> {
    const urls: string[] = [];
    for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('dossiers')
            .upload(filePath, file);

        if (uploadError) {
            console.error('Upload error:', uploadError);
            continue;
        }

        const { data } = supabase.storage.from('dossiers').getPublicUrl(filePath);
        urls.push(data.publicUrl);
    }
    return urls;
}

interface BookingWizardProps {
    studioId: string;
    studioName: string;
    isOpen: boolean;
    onClose: () => void;
}

import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Init Stripe (Move to env var later)
const stripePromise = loadStripe(import.meta.env.PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

function CheckoutForm({ onSuccess }: { onSuccess: () => void }) {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Return URL is standard for redirect flow, but we can handle some locally?
                // For PaymetElement, redirect is often required.
                // We can set return_url to a success page or current page?
                return_url: window.location.href, // This might reload the page.
            },
            redirect: "if_required" // Try to avoid redirect if possible
        });

        if (error) {
            setMessage(error.message || "An unexpected error occurred.");
            setIsLoading(false);
        } else {
            // Success!
            onSuccess();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />
            {message && <div className="text-red-500 text-sm">{message}</div>}
            <button
                type="submit"
                disabled={!stripe || isLoading}
                className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
                {isLoading ? "Processing..." : "Pay Deposit ($50.00)"}
            </button>
        </form>
    );
}

import SchedulingStep from './SchedulingStep';

// ... (CheckoutForm above)

export default function BookingWizard({ studioId, studioName, isOpen, onClose }: BookingWizardProps) {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [files, setFiles] = useState<File[]>([]);
    const [bookingDate, setBookingDate] = useState<Date | undefined>(undefined);
    const [bookingTime, setBookingTime] = useState<string | undefined>(undefined);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        body_zone: 'Arm',
        budget_min: 100,
        budget_max: 500,
    });

    if (!isOpen) return null;

    // Step 3 -> 4 Transition: Create Booking & Intent
    const handleProceedToPayment = async () => {
        if (!bookingDate || !bookingTime) {
            alert("Please select a date and time");
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Upload Images
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("You must be logged in");

            const imageUrls = await uploadImages(files, user.id);

            // Combine date + timeString into a full ISO string
            const combinedDate = new Date(bookingDate);
            const [hours, minutes] = bookingTime.split(':');
            combinedDate.setHours(parseInt(hours), parseInt(minutes));

            // 2. Submit Action
            const { data, error } = await actions.createDossier({
                ...formData,
                studio_id: studioId,
                concept_images: imageUrls,
                booking_date: combinedDate.toISOString() // Pass this to action
            });

            if (error) {
                alert("Error: " + error.message);
                setIsSubmitting(false);
            } else {
                if (data.clientSecret) {
                    setClientSecret(data.clientSecret);
                    setStep(4); // Go to Payment
                } else {
                    alert("Booking created successfully!");
                    onClose();
                }
                setIsSubmitting(false);
            }
        } catch (e: any) {
            alert("An unexpected error occurred: " + e.message);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-border flex justify-between items-center bg-muted/20">
                    <div>
                        <h2 className="text-xl font-outfit font-bold text-foreground">
                            {step === 3 ? "Secure Deposit" : "Start a Project"}
                        </h2>
                        <p className="text-sm text-muted-foreground">Booking with {studioName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
                        <X size={20} className="text-muted-foreground" />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-muted h-1">
                    <div
                        className="bg-primary h-full transition-all duration-300 ease-out"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto flex-1">

                    {step === 1 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium text-foreground">Tell us about your idea</h3>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Project Title</label>
                                <input
                                    type="text"
                                    className="w-full p-3 rounded-lg bg-background border border-input focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                    placeholder="e.g., Cyberpunk Sleeve"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Placement</label>
                                <select
                                    className="w-full p-3 rounded-lg bg-background border border-input focus:ring-2 focus:ring-primary/50 outline-none"
                                    value={formData.body_zone}
                                    onChange={(e) => setFormData({ ...formData, body_zone: e.target.value })}
                                >
                                    <option value="Arm">Arm</option>
                                    <option value="Leg">Leg</option>
                                    <option value="Chest">Chest</option>
                                    <option value="Back">Back</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Description</label>
                                <textarea
                                    className="w-full p-3 rounded-lg bg-background border border-input h-32 focus:ring-2 focus:ring-primary/50 outline-none resize-none"
                                    placeholder="Describe the style, elements, and meaning..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium text-foreground">Budget & Reference</h3>

                            <p className="text-sm text-muted-foreground">Upload any reference images (optional)</p>
                            <ImageUpload
                                onImagesSelected={(newFiles) => setFiles([...files, ...newFiles])}
                                maxFiles={3}
                            />

                            <div className="space-y-4 pt-4 border-t border-border">
                                <label className="text-sm font-medium text-muted-foreground">Estimated Budget ($)</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="number"
                                        className="w-1/2 p-3 rounded-lg bg-background border border-input"
                                        placeholder="Min"
                                        value={formData.budget_min}
                                        onChange={(e) => setFormData({ ...formData, budget_min: Number(e.target.value) })}
                                    />
                                    <span className="text-muted-foreground">-</span>
                                    <input
                                        type="number"
                                        className="w-1/2 p-3 rounded-lg bg-background border border-input"
                                        placeholder="Max"
                                        value={formData.budget_max}
                                        onChange={(e) => setFormData({ ...formData, budget_max: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium text-foreground">Select a Time</h3>
                            <SchedulingStep
                                artistId={studioId} // Assuming studioId implies artistId for single-artist studio simplified flow
                                selectedDate={bookingDate}
                                selectedTime={bookingTime}
                                onSlotSelect={(date, time) => {
                                    setBookingDate(date);
                                    setBookingTime(time);
                                }}
                            />
                        </div>
                    )}

                    {step === 4 && clientSecret && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium text-foreground mb-4">Confirm & Pay Deposit</h3>
                            <div className="bg-muted/30 p-4 rounded-lg border border-border mb-6">
                                <h4 className="font-bold text-sm text-foreground mb-2">Booking Summary</h4>
                                <p className="text-sm text-muted-foreground flex justify-between">
                                    <span>Date:</span>
                                    <span className="text-foreground">{bookingDate ? bookingDate.toLocaleDateString() : 'N/A'}</span>
                                </p>
                                <p className="text-sm text-muted-foreground flex justify-between">
                                    <span>Time:</span>
                                    <span className="text-foreground">{bookingTime || 'N/A'}</span>
                                </p>
                                <p className="text-sm text-muted-foreground flex justify-between mt-2 pt-2 border-t border-border">
                                    <span>Deposit:</span>
                                    <span className="text-foreground font-bold">$50.00</span>
                                </p>
                            </div>
                            <Elements stripe={stripePromise} options={{ clientSecret }}>
                                <CheckoutForm onSuccess={() => {
                                    alert("Payment Successful! Booking Confirmed.");
                                    onClose();
                                }} />
                            </Elements>
                        </div>
                    )}
                </div>

                {/* Footer Navigation */}
                <div className="p-6 border-t border-border flex justify-between bg-muted/20">
                    {step > 1 && step < 3 && (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="px-6 py-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors font-medium"
                        >
                            Back
                        </button>
                    )}
                    <div className="flex-1"></div> {/* Spacer */}

                    {step === 1 && (
                        <button
                            onClick={() => setStep(2)}
                            className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-bold"
                        >
                            Next Step <ChevronRight size={18} />
                        </button>
                    )}

                    {step === 2 && (
                        <button
                            onClick={handleProceedToPayment}
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-bold disabled:opacity-50"
                        >
                            {isSubmitting ? "Generating Request..." : "Proceed to Payment"} <ChevronRight size={18} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
