import React from 'react';
import type { Offer } from '../../types/database';
import { Tag } from 'lucide-react';

interface OfferGridProps {
    items: Offer[];
}

export function OfferGrid({ items }: OfferGridProps) {
    if (!items || items.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                No special offers currently available.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((item) => (
                <div key={item.id} className="bg-card border border-border rounded-xl overflow-hidden flex flex-col md:flex-row hover:border-primary/50 transition-colors group">
                    {item.image_url && (
                        <div className="w-full md:w-1/3 aspect-video md:aspect-auto overflow-hidden">
                            <img
                                src={item.image_url}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                    )}
                    <div className="p-6 flex-1 flex flex-col justify-center">
                        <div className="flex items-center gap-2 text-primary font-bold text-sm mb-2">
                            <Tag size={16} />
                            {item.discount_percentage ? `${item.discount_percentage}% OFF` : 'SPECIAL OFFER'}
                        </div>
                        <h3 className="font-bold text-xl text-foreground mb-2">{item.title}</h3>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{item.description}</p>

                        <div className="flex items-center justify-between mt-auto">
                            {item.price && (
                                <div className="text-lg font-bold text-foreground">
                                    ${item.price}
                                </div>
                            )}
                            <button className="px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg text-sm font-medium transition-colors">
                                Claim Offer
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
