import React, { useState, useEffect } from 'react';
import { Menu, X, LogIn } from 'lucide-react';

export default function MainNavbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const links = [
        { name: 'Home', href: '/' },
        { name: 'Explore', href: '/explore' },
        { name: 'Artists', href: '/artists' },
        { name: 'Studios', href: '/studios' },
        { name: 'Blog', href: '/blog' },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled || isMobileMenuOpen
                    ? 'bg-black/80 backdrop-blur-lg border-b border-white/10'
                    : 'bg-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <a href="/" className="flex items-center gap-2 group z-50">
                        <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform">
                            I
                        </div>
                        <span className="text-xl font-bold text-white tracking-tighter">
                            INKLINK
                        </span>
                    </a>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {links.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="text-sm font-medium text-zinc-300 hover:text-white transition-colors relative group"
                            >
                                {link.name}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all group-hover:w-full" />
                            </a>
                        ))}
                    </div>

                    {/* Desktop Auth */}
                    <div className="hidden md:flex items-center gap-4">
                        <a
                            href="/auth/login"
                            className="text-sm font-medium text-white hover:text-blue-400 transition-colors"
                        >
                            Log in
                        </a>
                        <a
                            href="/auth/register"
                            className="px-5 py-2.5 rounded-full bg-white text-black text-xs font-bold uppercase tracking-wide hover:bg-zinc-200 transition-all transform hover:scale-105 shadow-lg"
                        >
                            Sign Up
                        </a>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden z-50">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-white hover:text-blue-400 transition-colors p-2"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <div
                className={`fixed inset-0 bg-black/95 backdrop-blur-xl z-40 transition-transform duration-300 ease-in-out md:hidden flex flex-col items-center justify-center gap-8 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
                style={{ top: 0 }} // Ensure it covers the whole screen including behind the nav bar area if needed
            >
                {links.map((link) => (
                    <a
                        key={link.name}
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-2xl font-bold text-white hover:text-blue-500 transition-colors"
                    >
                        {link.name}
                    </a>
                ))}

                <div className="flex flex-col gap-4 mt-8">
                    <a
                        href="/auth/login"
                        className="text-lg font-medium text-zinc-300 hover:text-white transition-colors text-center"
                    >
                        Log in
                    </a>
                    <a
                        href="/auth/register"
                        className="px-8 py-3 rounded-full bg-blue-600 text-white text-sm font-bold uppercase tracking-wide hover:bg-blue-500 transition-all shadow-lg"
                    >
                        Sign Up
                    </a>
                </div>
            </div>
        </nav>
    );
}
