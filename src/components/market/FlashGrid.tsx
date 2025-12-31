import React from 'react';
import type { FlashTattoo } from '../../types/database';
import { Badge } from 'lucide-react'; // Placeholder badge icon, mostly using UI badge

interface FlashGridProps {
    items: FlashTattoo[];
}

export function FlashGrid({ items }: FlashGridProps) {
    if (!items || items.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                No flash tattoos available at the moment.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
                <div key={item.id} className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
                    <div className="aspect-[3/4] overflow-hidden relative">
                        <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {item.price && (
                            <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm font-bold">
                                ${item.price}
                            </div>
                        )}
                    </div>
                    <div className="p-4">
                        <h3 className="font-bold text-lg text-foreground mb-1">{item.title}</h3>
                        {item.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{item.description}</p>
                        )}
                        <button className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
                            Book This Flash
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
