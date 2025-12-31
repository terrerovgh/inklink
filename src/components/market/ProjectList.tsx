import React, { useState } from 'react';
import type { Dossier } from '../../types/database';
import { MapPin, Calendar, ArrowRight, MessageCircle } from 'lucide-react';
import { actions } from 'astro:actions';

interface ProjectListProps {
    items: Dossier[];
}

export function ProjectList({ items }: ProjectListProps) {
    const [contactingId, setContactingId] = useState<string | null>(null);

    const handleContact = async (dossierId: string) => {
        setContactingId(dossierId);
        try {
            const { data, error } = await actions.inquireDossier({
                dossier_id: dossierId,
                message: "I'm interested in your project!"
            });

            if (error) {
                if (error.code === 'UNAUTHORIZED') {
                    alert("Please log in as an artist to contact.");
                } else {
                    alert("Error: " + error.message);
                }
            } else {
                alert("Inquiry sent! Check your dashboard for the conversation.");
            }
        } catch (e: any) {
            alert(e.message);
        } finally {
            setContactingId(null);
        }
    };

    if (!items || items.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                No active community projects found. Be the first to post one!
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {items.map((item) => (
                <div key={item.id} className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-bold text-xl text-foreground mb-1">{item.title}</h3>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                        <span className="bg-muted px-2 py-1 rounded text-xs uppercase tracking-wider font-semibold">
                                            {item.body_zone || 'Any Placement'}
                                        </span>
                                        {item.budget_min && item.budget_max && (
                                            <span>${item.budget_min} - ${item.budget_max}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <p className="text-foreground/80 mb-4 line-clamp-2">{item.description}</p>

                            {item.concept_images && item.concept_images.length > 0 && (
                                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                                    {item.concept_images.slice(0, 4).map((img, i) => (
                                        <img key={i} src={img} className="w-16 h-16 rounded object-cover border border-border" alt="Reference" />
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col justify-center items-end gap-3 min-w-[140px]">
                            <button
                                onClick={() => handleContact(item.id)}
                                disabled={contactingId === item.id}
                                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-bold hover:opacity-90 transition-opacity w-full justify-center disabled:opacity-50"
                            >
                                {contactingId === item.id ? (
                                    "Sending..."
                                ) : (
                                    <>
                                        <MessageCircle size={18} /> Contact
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
