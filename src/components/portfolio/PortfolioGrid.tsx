import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface PortfolioGridProps {
    works: Array<{ id: string; url: string; title?: string }>;
    viewMode: 'grid' | 'masonry';
}

export default function PortfolioGrid({ works, viewMode }: PortfolioGridProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const items = gsap.utils.toArray('.portfolio-item');

            gsap.fromTo(items,
                {
                    y: 100,
                    opacity: 0,
                    scale: 0.9
                },
                {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 0.8,
                    stagger: 0.1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "top 80%",
                    }
                }
            );
        }, containerRef);

        return () => ctx.revert();
    }, [works, viewMode]);

    return (
        <section ref={containerRef} className="w-full">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-8 text-center md:text-left">
                Selected Works ({works.length})
            </h2>

            <div className={
                viewMode === 'masonry'
                    ? "columns-2 md:columns-3 gap-4 space-y-4"
                    : "grid grid-cols-2 md:grid-cols-3 gap-4"
            }>
                {works.map((work) => (
                    <div
                        key={work.id}
                        className="portfolio-item break-inside-avoid relative group rounded-xl overflow-hidden bg-muted cursor-zoom-in"
                    >
                        <img
                            src={work.url}
                            alt={work.title || 'Portfolio Work'}
                            className="w-full h-auto object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 text-center">
                            {work.title && (
                                <h3 className="text-white font-bold translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                    {work.title}
                                </h3>
                            )}
                            <span className="mt-2 text-xs text-white/70 uppercase tracking-wider translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                                View Detail
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
