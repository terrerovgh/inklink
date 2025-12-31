import React, { useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, isSameDay, parse, addMinutes, isBefore, startOfToday } from 'date-fns';
import { supabase } from '../../../lib/supabase';
import { cn } from '../../../lib/utils';
import 'react-day-picker/dist/style.css'; // Basic styles

interface SchedulingStepProps {
    artistId: string;
    onSlotSelect: (date: Date, time: string) => void;
    selectedDate?: Date;
    selectedTime?: string;
}

interface TimeSlot {
    time: string;
    available: boolean;
}

export default function SchedulingStep({ artistId, onSlotSelect, selectedDate: initialDate, selectedTime: initialTime }: SchedulingStepProps) {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialDate);
    const [selectedTime, setSelectedTime] = useState<string | undefined>(initialTime);
    const [availability, setAvailability] = useState<any[]>([]);
    const [bookedSlots, setBookedSlots] = useState<Date[]>([]);
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAvailability();
    }, [artistId]);

    useEffect(() => {
        if (selectedDate) {
            generateSlotsForDate(selectedDate);
        }
    }, [selectedDate, availability, bookedSlots]);

    const fetchAvailability = async () => {
        try {
            // 1. Get recurring rules
            const { data: availData } = await supabase
                .from('artist_availability')
                .select('*')
                .eq('artist_id', artistId)
                .eq('is_recurring', true);

            setAvailability(availData || []);

            // 2. Get existing bookings (Simplified: just fetch all future bookings for now)
            const { data: bookingData } = await supabase
                .from('bookings')
                .select('date')
                .eq('artist_id', artistId)
                .gte('date', new Date().toISOString()) as { data: { date: string }[] | null, error: any }; // Forced cast for simplicity if types mismatch

            if (bookingData) {
                setBookedSlots(bookingData.map(b => new Date(b.date)));
            }
        } catch (error) {
            console.error('Error fetching schedule:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateSlotsForDate = (date: Date) => {
        const dayOfWeek = date.getDay(); // 0 = Sunday
        const rule = availability.find(r => r.day_of_week === dayOfWeek);

        if (!rule) {
            setAvailableSlots([]);
            return;
        }

        const start = parse(rule.start_time, 'HH:mm:ss', date);
        const end = parse(rule.end_time, 'HH:mm:ss', date);
        const slots: TimeSlot[] = [];

        let current = start;
        while (isBefore(current, end)) {
            const timeString = format(current, 'HH:mm');

            // Check if blocked by booking
            // (This is a simplified check. Real app needs duration checks)
            const isBooked = bookedSlots.some(b =>
                isSameDay(b, date) && format(b, 'HH:mm') === timeString
            );

            slots.push({
                time: timeString,
                available: !isBooked
            });

            current = addMinutes(current, 60); // 1 hour slots
        }

        setAvailableSlots(slots);
    };

    const handleDateSelect = (date: Date | undefined) => {
        setSelectedDate(date);
        setSelectedTime(undefined); // Reset time when date changes
    };

    const handleTimeSelect = (time: string) => {
        setSelectedTime(time);
        if (selectedDate) {
            onSlotSelect(selectedDate, time);
        }
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading schedule...</div>;

    // Custom modifiers for calendar (disable days with no availability rule)
    const disabledDays = (date: Date) => {
        const dayOfWeek = date.getDay();
        return !availability.some(r => r.day_of_week === dayOfWeek) || isBefore(date, startOfToday());
    };

    return (
        <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
                <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={disabledDays}
                    className="border rounded-lg p-4 bg-background w-fit mx-auto md:w-full"
                    modifiersClassNames={{
                        selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md transition-colors",
                        today: "text-accent-foreground font-bold"
                    }}
                    styles={{
                        caption: { color: 'var(--foreground)' },
                        head: { color: 'var(--muted-foreground)' },
                        day: { color: 'var(--foreground)' },
                    }}
                />
            </div>

            <div className="flex-1 border-l pl-8 border-border min-h-[300px]">
                <h4 className="font-medium text-foreground mb-4">
                    {selectedDate ? format(selectedDate, 'EEEE, MMMM do') : 'Select a date'}
                </h4>

                {!selectedDate ? (
                    <p className="text-sm text-muted-foreground">Please choose a date from the calendar to view available times.</p>
                ) : availableSlots.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No available slots for this date.</p>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {availableSlots.map(slot => (
                            <button
                                key={slot.time}
                                onClick={() => handleTimeSelect(slot.time)}
                                disabled={!slot.available}
                                className={cn(
                                    "p-3 rounded-lg text-sm border transition-all text-center",
                                    selectedTime === slot.time
                                        ? "bg-primary text-primary-foreground border-primary ring-2 ring-primary/30"
                                        : slot.available
                                            ? "bg-muted/50 border-input hover:border-primary/50 text-foreground"
                                            : "opacity-40 cursor-not-allowed bg-muted text-muted-foreground decoration-line-through"
                                )}
                            >
                                {format(parse(slot.time, 'HH:mm', new Date()), 'h:mm a')}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
