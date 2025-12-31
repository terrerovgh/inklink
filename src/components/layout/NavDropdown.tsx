import React, { useState, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface NavDropdownProps {
    label: string;
    items: { label: string; href: string; description?: string }[];
    href?: string;
}

export default function NavDropdown({ label, items, href }: NavDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsOpen(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setIsOpen(false);
        }, 150);
    };

    return (
        <div
            className="relative group"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <a
                href={href || '#'}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors px-3 py-2 rounded-full hover:bg-white/10 ${isOpen ? 'text-white bg-white/10' : 'text-zinc-300 hover:text-white'
                    }`}
            >
                {label}
                {items.length > 0 && (
                    <ChevronDown
                        size={14}
                        className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''
                            }`}
                    />
                )}
            </a>

            {isOpen && items.length > 0 && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 origin-top animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="p-2 rounded-2xl bg-black/60 backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden ring-1 ring-white/5">
                        <div className="flex flex-col gap-1">
                            {items.map((item) => (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    className="group flex flex-col p-3 rounded-xl hover:bg-white/10 transition-colors"
                                >
                                    <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                                        {item.label}
                                    </span>
                                    {item.description && (
                                        <span className="text-xs text-zinc-400 mt-0.5 line-clamp-1">
                                            {item.description}
                                        </span>
                                    )}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
