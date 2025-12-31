import React, { useState, useEffect } from 'react';

export const StickyDiscountBanner: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        // Check if previously dismissed
        const dismissed = localStorage.getItem('discount_banner_dismissed');
        if (dismissed) {
            setIsDismissed(true);
            return;
        }

        // Timer: Show after 30 seconds
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 30000);

        // Scroll: Show after 70% scroll
        const handleScroll = () => {
            const scrollPosition = window.scrollY + window.innerHeight;
            const docHeight = document.documentElement.scrollHeight;

            if (scrollPosition >= docHeight * 0.7) {
                setIsVisible(true);
                // Clean up scroll listener once triggered
                window.removeEventListener('scroll', handleScroll);
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        setIsDismissed(true);
        localStorage.setItem('discount_banner_dismissed', 'true');
    };

    if (isDismissed || !isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-in slide-in-from-bottom duration-500">
            <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-black/80 backdrop-blur-xl shadow-2xl">
                <div className="flex flex-col items-center justify-between gap-4 p-6 md:flex-row">

                    <div className="flex-1 text-center md:text-left">
                        <h3 className="text-xl font-bold bg-gradient-to-r from-amber-200 to-yellow-500 bg-clip-text text-transparent">
                            Want the Ultimate Tattoo Aftercare Guide?
                        </h3>
                        <p className="mt-2 text-sm text-gray-300">
                            Subscribe to our newsletter and get our expert-approved PDF guide instantly. Plus, exclusive deals on pro gear!
                        </p>
                    </div>

                    <div className="flex w-full flex-col gap-3 md:w-auto">
                        <form className="flex w-full gap-2">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white placeholder-gray-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                            />
                            <button
                                type="submit"
                                className="whitespace-nowrap rounded-lg bg-amber-500 px-6 py-2 font-semibold text-black hover:bg-amber-400 transition-colors"
                                onClick={(e) => {
                                    e.preventDefault();
                                    // TODO: Implement newsletter signup logic
                                    alert('Thanks for subscribing! Check your email.');
                                    handleDismiss();
                                }}
                            >
                                Get Guide
                            </button>
                        </form>
                        <button
                            onClick={handleDismiss}
                            className="text-xs text-gray-500 hover:text-white transition-colors"
                        >
                            No thanks, I fully understand tattoo care.
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
