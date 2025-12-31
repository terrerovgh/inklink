import React, { useState, useEffect } from 'react';
import { Menu, X, User, LayoutDashboard, LogOut } from 'lucide-react';
import NavDropdown from './NavDropdown';
import MobileNav from './MobileNav';
import { supabase } from '../../lib/supabase';

export default function MainNavbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [user, setUser] = useState<any | null>(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        // Auth state handling
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        window.addEventListener('scroll', handleScroll);
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            subscription.unsubscribe();
        };
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        // Clear cookies manually to ensure middleware sync
        document.cookie = "sb-access-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        document.cookie = "sb-refresh-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        window.location.href = "/";
    };

    // Navigation Structure
    const navigation = [
        {
            label: 'Home',
            href: '/',
            items: []
        },
        {
            label: 'Explore',
            href: '/explore',
            items: [
                { label: 'Interactive Map', href: '/explore/map', description: 'Find artists near you' },
                { label: 'Browse Styles', href: '/explore/styles', description: 'Discover your next tattoo' },
                { label: 'Search', href: '/search', description: 'Search database' }
            ]
        },
        {
            label: 'Artists',
            href: '/artists',
            items: [
                { label: 'Featured Artists', href: '/artists?sort=featured', description: 'Top rated talent' },
                { label: 'New Arrivals', href: '/artists?sort=new', description: 'Fresh faces in the scene' },
                { label: 'For Artists', href: '/for-artists', description: 'Join InkLink' }

            ]
        },
        {
            label: 'Studios',
            href: '/studios',
            items: [
                { label: 'Top Studios', href: '/studios', description: 'Premium spaces' },
                { label: 'Studio Owners', href: '/for-studios', description: 'Manage your business' }
            ]
        },
        {
            label: 'Shop',
            href: '/shop',
            items: [
                { label: 'Pro Gear', href: '/shop?category=gear', description: 'Equipment for pros' },
                { label: 'Merch', href: '/shop?category=merch', description: 'InkLink apparel' }
            ]
        },
        {
            label: 'Blog',
            href: '/blog',
            items: [
                { label: 'Latest Stories', href: '/blog', description: 'Tattoo culture & news' },
                { label: 'Guides', href: '/blog/guides', description: 'Tips & Aftercare' }
            ]
        }
    ];

    return (
        <>
            <nav
                className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 border-b ${isScrolled
                    ? 'bg-black/40 backdrop-blur-2xl border-white/5 py-2'
                    : 'bg-transparent border-transparent py-4'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-14">
                        {/* Logo */}
                        <a href="/" className="flex items-center gap-2 group relative z-50">
                            <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                                I
                            </div>
                            <span className="text-xl font-bold text-white tracking-tighter opacity-90 group-hover:opacity-100 transition-opacity">
                                INKLINK
                            </span>
                        </a>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-1">
                            {navigation.map((item) => (
                                <NavDropdown
                                    key={item.label}
                                    label={item.label}
                                    items={item.items}
                                    href={item.href}
                                />
                            ))}
                        </div>

                        {/* Desktop Auth */}
                        <div className="hidden md:flex items-center gap-4">
                            {user ? (
                                <div className="flex items-center gap-3">
                                    <a
                                        href="/dashboard"
                                        className="flex items-center gap-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                                    >
                                        <LayoutDashboard size={18} />
                                        Dashboard
                                    </a>
                                    <div className="w-px h-4 bg-white/10 mx-1" />
                                    <div className="relative group/user">
                                        <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold">
                                                {user.email?.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-sm font-medium text-white">{user.email?.split('@')[0]}</span>
                                        </button>

                                        <div className="absolute right-0 top-full mt-2 w-48 py-2 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover/user:opacity-100 group-hover/user:translate-y-0 group-hover/user:pointer-events-auto transition-all duration-200">
                                            <a href="/dashboard/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
                                                <User size={16} />
                                                My Profile
                                            </a>
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors w-full"
                                            >
                                                <LogOut size={16} />
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <a
                                        href="/auth/signin"
                                        className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                                    >
                                        Log in
                                    </a>
                                    <a
                                        href="/auth/register"
                                        className="px-5 py-2 rounded-full bg-white text-black text-xs font-bold uppercase tracking-wide hover:bg-zinc-200 transition-all transform hover:scale-105 shadow-lg"
                                    >
                                        Sign Up
                                    </a>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden z-50">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
                            >
                                {isMobileMenuOpen ? (
                                    <X size={24} className="animate-in spin-in-90 duration-200" />
                                ) : (
                                    <Menu size={24} className="animate-in fade-in duration-200" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            <MobileNav
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                items={navigation}
                user={user}
                onLogout={handleLogout}
            />
        </>
    );
}
