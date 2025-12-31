import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import BookingWizard from '../booking/BookingWizard';

interface StudioActionsProps {
    studioId: string;
    studioName: string;
}

export default function StudioActions({ studioId, studioName }: StudioActionsProps) {
    const [isBookingOpen, setIsBookingOpen] = useState(false);

    return (
        <div className="flex gap-3 mb-2">
            <button
                onClick={() => setIsBookingOpen(true)}
                className="bg-gradient-to-r from-primary to-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
                Book Appointment
            </button>
            <button className="bg-white/10 backdrop-blur-md border border-white/10 text-white p-3 rounded-xl hover:bg-white/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                <MessageSquare size={20} />
            </button>

            <BookingWizard
                studioId={studioId}
                studioName={studioName}
                isOpen={isBookingOpen}
                onClose={() => setIsBookingOpen(false)}
            />
        </div>
    );
}
