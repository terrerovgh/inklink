import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { cn } from '../../../lib/utils';
import { Check, Clock, Save, X } from 'lucide-react';

interface AvailabilitySlot {
    id?: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_recurring: boolean;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AvailabilityManager({ artistId }: { artistId: string }) {
    const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        fetchAvailability();
    }, [artistId]);

    const fetchAvailability = async () => {
        try {
            const { data, error } = await supabase
                .from('artist_availability')
                .select('*')
                .eq('artist_id', artistId)
                .eq('is_recurring', true);

            if (error) throw error;
            setAvailability(data || []);
        } catch (error) {
            console.error('Error fetching availability:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTimeChange = (dayIndex: number, type: 'start' | 'end', value: string) => {
        const existingSlot = availability.find(s => s.day_of_week === dayIndex);

        if (existingSlot) {
            setAvailability(prev => prev.map(s =>
                s.day_of_week === dayIndex ? { ...s, [type === 'start' ? 'start_time' : 'end_time']: value } : s
            ));
        } else {
            setAvailability(prev => [...prev, {
                day_of_week: dayIndex,
                start_time: type === 'start' ? value : '09:00:00',
                end_time: type === 'end' ? value : '17:00:00',
                is_recurring: true
            }]);
        }
    };

    const toggleDay = (dayIndex: number) => {
        const exists = availability.find(s => s.day_of_week === dayIndex);
        if (exists) {
            setAvailability(prev => prev.filter(s => s.day_of_week !== dayIndex));
        } else {
            setAvailability(prev => [...prev, {
                day_of_week: dayIndex,
                start_time: '09:00',
                end_time: '17:00',
                is_recurring: true
            }]);
        }
    };

    const saveAvailability = async () => {
        setSaving(true);
        setMessage(null);
        try {
            // 1. Delete existing recurring slots (simplified update strategy)
            const { error: deleteError } = await supabase
                .from('artist_availability')
                .delete()
                .eq('artist_id', artistId)
                .eq('is_recurring', true);

            if (deleteError) throw deleteError;

            // 2. Insert new slots
            const slotsToInsert = availability.map(slot => ({
                artist_id: artistId,
                day_of_week: slot.day_of_week,
                start_time: slot.start_time,
                end_time: slot.end_time,
                is_recurring: true
            }));

            const { error: insertError } = await supabase
                .from('artist_availability')
                .insert(slotsToInsert);

            if (insertError) throw insertError;

            setMessage('Availability saved successfully!');
            setTimeout(() => setMessage(null), 3000);
        } catch (error: any) {
            console.error('Error saving:', error);
            setMessage('Error saving availability: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6 bg-card border border-border rounded-xl p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-foreground">Weekly Availability</h2>
                    <p className="text-sm text-muted-foreground">Set your recurring working hours.</p>
                </div>
                <button
                    onClick={saveAvailability}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50"
                >
                    {saving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                </button>
            </div>

            {message && (
                <div className={cn("p-3 rounded-lg text-sm", message.includes('Error') ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500")}>
                    {message}
                </div>
            )}

            <div className="grid gap-4">
                {DAYS.map((day, index) => {
                    const slot = availability.find(s => s.day_of_week === index);
                    const isActive = !!slot;

                    return (
                        <div key={day} className={cn(
                            "flex items-center gap-4 p-4 rounded-lg border transition-colors",
                            isActive ? "bg-muted/30 border-primary/30" : "bg-background border-border opacity-60"
                        )}>
                            <div className="w-32 flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={() => toggleDay(index)}
                                    className="w-5 h-5 rounded border-input text-primary focus:ring-primary"
                                />
                                <span className="font-medium">{day}</span>
                            </div>

                            {isActive ? (
                                <div className="flex items-center gap-2 flex-1">
                                    <div className="flex items-center gap-2 bg-background border border-input rounded-md px-3 py-1">
                                        <Clock size={14} className="text-muted-foreground" />
                                        <input
                                            type="time"
                                            value={slot.start_time}
                                            onChange={(e) => handleTimeChange(index, 'start', e.target.value)}
                                            className="bg-transparent outline-none text-sm w-24"
                                        />
                                    </div>
                                    <span className="text-muted-foreground">-</span>
                                    <div className="flex items-center gap-2 bg-background border border-input rounded-md px-3 py-1">
                                        <Clock size={14} className="text-muted-foreground" />
                                        <input
                                            type="time"
                                            value={slot.end_time}
                                            onChange={(e) => handleTimeChange(index, 'end', e.target.value)}
                                            className="bg-transparent outline-none text-sm w-24"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <span className="text-sm text-muted-foreground italic">Unavailable</span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
