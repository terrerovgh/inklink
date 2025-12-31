import React, { useState } from 'react';
import { ChevronDown, Plus, Minus } from 'lucide-react';

interface MobileNavProps {
    isOpen: boolean;
    onClose: () => void;
    user: any | null;
    onLogout?: () => void;
    items: {
        label: string;
        href?: string;
        items?: { label: string; href: string; description?: string }[];
    }[];
}

export default function MobileNav({ isOpen, onClose, items, user, onLogout }: MobileNavProps) {
    const [expandedItem, setExpandedItem] = useState<string | null>(null);

    const toggleExpand = (label: string) => {
        setExpandedItem(expandedItem === label ? null : label);
    };

    return (
        <div
            className={`fixed inset-0 z-40 bg-black/90 backdrop-blur-3xl transition-all duration-500 ease-in-out ${isOpen
                ? 'opacity-100 translate-y-0 pointer-events-auto'
                : 'opacity-0 translate-y-4 pointer-events-none'
                }`}
            style={{ top: 0 }}
        >
            <div className="flex flex-col h-full pt-24 pb-8 px-6 overflow-y-auto">
                <nav className="flex-1 flex flex-col gap-2">
                    {items.map((item) => (
                        <div key={item.label} className="border-b border-white/5 pb-2">
                            <div className="flex items-center justify-between">
                                <a
                                    href={item.href || '#'}
                                    onClick={(e) => {
                                        if (item.items) {
                                            e.preventDefault();
                                            toggleExpand(item.label);
                                        } else {
                                            onClose();
                                        }
                                    }}
                                    className="flex-1 py-3 text-2xl font-bold text-white hover:text-blue-400 transition-colors tracking-tight"
                                >
                                    {item.label}
                                </a>
                                {item.items && (
                                    <button
                                        onClick={() => toggleExpand(item.label)}
                                        className="p-3 text-zinc-400 hover:text-white transition-colors"
                                    >
                                        {expandedItem === item.label ? (
                                            <Minus size={20} />
                                        ) : (
                                            <Plus size={20} />
                                        )}
                                    </button>
                                )}
                            </div>

                            <div
                                className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedItem === item.label
                                    ? 'max-h-96 opacity-100 mt-2'
                                    : 'max-h-0 opacity-0'
                                    }`}
                            >
                                <div className="flex flex-col gap-2 pl-4 pb-4 border-l-2 border-white/10 ml-2">
                                    {item.items?.map((subItem) => (
                                        <a
                                            key={subItem.label}
                                            href={subItem.href}
                                            onClick={onClose}
                                            className="py-2 text-lg font-medium text-zinc-400 hover:text-white transition-colors block"
                                        >
                                            {subItem.label}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </nav>

                <div className="mt-8 flex flex-col gap-4">
                    {user ? (
                        <>
                            <a
                                href="/dashboard"
                                onClick={onClose}
                                className="w-full py-4 rounded-xl bg-blue-600 text-center font-bold text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20"
                            >
                                Client Dashboard
                            </a>
                            <button
                                onClick={() => {
                                    onLogout?.();
                                    onClose();
                                }}
                                className="w-full py-4 rounded-xl border border-red-500/20 bg-red-500/5 text-center font-bold text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <>
                            <a
                                href="/auth/signin"
                                onClick={onClose}
                                className="w-full py-4 rounded-xl border border-white/10 bg-white/5 text-center font-bold text-white hover:bg-white/10 transition-colors backdrop-blur-md"
                            >
                                Log In
                            </a>
                            <a
                                href="/auth/register"
                                onClick={onClose}
                                className="w-full py-4 rounded-xl bg-blue-600 text-center font-bold text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20"
                            >
                                Sign Up Free
                            </a>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
