import React from 'react';
import { Star, ArrowRight, ShoppingBag } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';

const RECOMMENDATIONS = [
    {
        id: 1,
        title: 'InkLink Aftercare Balm',
        price: 15,
        rating: 4.8,
        reviews: 120,
        image: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=600&q=80',
        tag: 'Best Seller'
    },
    {
        id: 2,
        title: 'Daily Moisturizer SPF 30',
        price: 22,
        rating: 4.9,
        reviews: 85,
        image: 'https://images.unsplash.com/photo-1598371839696-5c5bbcece707?w=600&q=80',
        tag: 'New'
    },
    {
        id: 3,
        title: 'Vibrant Color Enhancer',
        price: 18,
        rating: 4.7,
        reviews: 210,
        image: 'https://images.unsplash.com/photo-1590246130796-54238a2995bd?w=600&q=80',
        tag: null
    }
];

export const ShopRecommendations = () => {
    return (
        <section className="py-24 bg-zinc-950 text-white relative overflow-hidden">
            {/* Background accent */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-900/10 to-transparent pointer-events-none" />

            <div className="absolute -left-20 top-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-16 items-center">

                    <div className="lg:col-span-1 text-center lg:text-left">
                        <span className="text-blue-500 font-bold uppercase tracking-wider text-sm mb-3 block">InkLink Shop</span>
                        <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">Premium Care <br />for Your Ink</h2>
                        <p className="text-zinc-400 mb-8 leading-relaxed text-lg">
                            Curated products to keep your tattoos looking as fresh as the day you got them. Verified by our artists.
                        </p>
                        <Button size="lg" className="rounded-full px-8 py-6 text-base shadow-lg shadow-white/10 text-black bg-white hover:bg-zinc-200" asChild>
                            <a href="/shop">
                                Visit Shop <ArrowRight size={18} className="ml-2" />
                            </a>
                        </Button>
                    </div>

                    <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {RECOMMENDATIONS.map((product) => (
                            <Card key={product.id} className="group bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 hover:shadow-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2">
                                <CardContent className="p-5 flex flex-col h-full">
                                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-5 bg-black">
                                        <img
                                            src={product.image}
                                            alt={product.title}
                                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                                        />
                                        {product.tag && (
                                            <div className="absolute top-3 left-3">
                                                <Badge variant="default" className="bg-blue-600 hover:bg-blue-700 text-white border-none shadow-lg">
                                                    {product.tag}
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-auto">
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <Star size={14} className="text-yellow-400 fill-yellow-400" />
                                            <span className="text-sm font-medium text-zinc-300">{product.rating}</span>
                                            <span className="text-xs text-zinc-500">({product.reviews} reviews)</span>
                                        </div>
                                        <h3 className="font-bold text-lg mb-2 text-zinc-100 group-hover:text-blue-400 transition-colors">{product.title}</h3>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xl font-bold text-white">${product.price}</span>
                                            <Button size="icon" variant="ghost" className="rounded-full hover:bg-blue-600 hover:text-white text-zinc-400">
                                                <ShoppingBag size={18} />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
};
