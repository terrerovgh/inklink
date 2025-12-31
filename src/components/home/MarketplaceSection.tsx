import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';

export interface MarketItem {
    id: string | number;
    title: string;
    price: number;
    currency: string;
    image: string;
    location: string;
    seller: string;
}

interface MarketplaceSectionProps {
    items?: MarketItem[];
}

export const MarketplaceSection = ({ items = [] }: MarketplaceSectionProps) => {
    return (
        <section className="py-24 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider text-sm">
                            <ShoppingBag size={18} />
                            <span>Marketplace</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Local Gear & Supplies</h2>
                    </div>
                    <Button variant="link" className="hidden sm:inline-flex items-center text-sm font-semibold text-zinc-900 dark:text-white hover:text-zinc-600 dark:hover:text-zinc-300 p-0" asChild>
                        <a href="/marketplace">
                            Browse all items <ArrowRight size={16} className="ml-1" />
                        </a>
                    </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {items.map((item) => (
                        <Card key={item.id} className="group bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 overflow-hidden hover:shadow-lg dark:hover:shadow-blue-900/10 hover:border-blue-500/30 dark:hover:border-blue-500/30 transition-all duration-300">
                            <CardContent className="p-0">
                                <div className="relative aspect-square bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-3 right-3">
                                        <Badge variant="secondary" className="bg-white/90 dark:bg-black/80 backdrop-blur-md text-zinc-900 dark:text-white border-none shadow-sm">
                                            {item.currency} {item.price}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="font-bold text-zinc-900 dark:text-white truncate mb-1 text-sm md:text-base">{item.title}</h3>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mb-4">{item.seller} • {item.location}</p>
                                    <Button className="w-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white hover:bg-zinc-900 hover:text-white dark:hover:bg-zinc-700 transition-all text-xs font-bold rounded-xl" size="sm" asChild>
                                        <a href={`/marketplace/${item.id}`}>View Details</a>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};
