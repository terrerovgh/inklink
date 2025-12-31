import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

interface AffiliateCardProps {
    product: {
        name: string;
        price: number | null;
        image_url: string | null;
        affiliate_url: string | null;
        is_recommended: boolean;
    };
}

export const AffiliateCard: React.FC<AffiliateCardProps> = ({ product }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLAnchorElement>(null);
    const shineRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const card = cardRef.current;
        const button = buttonRef.current;
        const shine = shineRef.current;

        if (!card || !button || !shine) return;

        // Hover animation for the card
        const hoverAnim = gsap.to(card, {
            scale: 1.02,
            duration: 0.3,
            ease: 'power2.out',
            paused: true,
        });

        // Shine animation for the button
        const shineAnim = gsap.to(shine, {
            x: '200%',
            duration: 1,
            ease: 'power2.inOut',
            paused: true,
        });

        const onEnter = () => {
            hoverAnim.play();
            shineAnim.restart();
        };

        const onLeave = () => {
            hoverAnim.reverse();
        };

        card.addEventListener('mouseenter', onEnter);
        card.addEventListener('mouseleave', onLeave);

        return () => {
            card.removeEventListener('mouseenter', onEnter);
            card.removeEventListener('mouseleave', onLeave);
            hoverAnim.kill();
            shineAnim.kill();
        };
    }, []);

    return (
        <div
            ref={cardRef}
            className="relative flex flex-col overflow-hidden rounded-xl border border-white/10 bg-black/40 backdrop-blur-sm shadow-xl transition-colors hover:border-white/20 group"
        >
            {product.is_recommended && (
                <div className="absolute top-0 right-0 z-10 rounded-bl-xl bg-gradient-to-br from-amber-400 to-orange-600 px-3 py-1 text-xs font-bold text-black shadow-lg">
                    PRO CHOICE
                </div>
            )}

            {/* Image Container */}
            <div className="relative aspect-square w-full overflow-hidden bg-white/5 p-4">
                {product.image_url ? (
                    <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-white/20">
                        No Image
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col p-4">
                <h3 className="mb-2 text-lg font-semibold text-white line-clamp-2">
                    {product.name}
                </h3>

                <div className="mt-auto flex items-center justify-between">
                    <div className="text-xl font-bold text-white">
                        {product.price ? `$${product.price.toFixed(2)}` : 'Check Price'}
                    </div>

                    <a
                        ref={buttonRef}
                        href={product.affiliate_url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative overflow-hidden rounded-lg bg-white px-4 py-2 text-sm font-bold text-black transition-transform active:scale-95"
                    >
                        <span className="relative z-10 flex items-center gap-1">
                            Buy Now
                            <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </span>
                        <div
                            ref={shineRef}
                            className="absolute inset-0 -translate-x-[100%] bg-gradient-to-r from-transparent via-white/50 to-transparent"
                        />
                    </a>
                </div>
            </div>
        </div>
    );
};
