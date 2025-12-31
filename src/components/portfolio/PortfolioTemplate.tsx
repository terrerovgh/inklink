import React, { useState } from 'react';
import { cn } from '../../lib/utils'; // Corrected path
import PortfolioHeader from './PortfolioHeader';
import PortfolioGrid from './PortfolioGrid';
import PortfolioControls from './PortfolioControls';

interface PortfolioTemplateProps {
    artist: {
        name: string;
        role: string;
        avatar_url: string;
        bio: string;
        instagram?: string;
        website?: string;
        email?: string;
    };
    works: Array<{ id: string; url: string; title?: string }>;
}

export default function PortfolioTemplate({ artist, works }: PortfolioTemplateProps) {
    const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('masonry');
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');

    return (
        <div className={cn("min-h-screen bg-background text-foreground font-sans transition-colors duration-500", theme)}>
            <div className="max-w-md mx-auto md:max-w-4xl lg:max-w-6xl px-4 py-8 md:py-12 pb-24">

                <PortfolioHeader artist={artist} />

                <div className="my-12 border-t border-border/40" />

                <PortfolioGrid works={works} viewMode={viewMode} />

                <PortfolioControls
                    currentTheme={theme}
                    onThemeChange={setTheme}
                    currentView={viewMode}
                    onViewChange={setViewMode}
                />
            </div>
        </div>
    );
}
