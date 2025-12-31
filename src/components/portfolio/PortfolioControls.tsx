import React, { useState } from 'react';
import { Palette, Grid, LayoutDashboard, X, Settings2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PortfolioControlsProps {
    currentTheme: 'light' | 'dark';
    onThemeChange: (theme: 'light' | 'dark') => void;
    currentView: 'grid' | 'masonry';
    onViewChange: (view: 'grid' | 'masonry') => void;
}

export default function PortfolioControls({
    currentTheme,
    onThemeChange,
    currentView,
    onViewChange
}: PortfolioControlsProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
            {isOpen && (
                <div className="bg-card/80 backdrop-blur-xl border border-border p-2 rounded-2xl shadow-2xl flex flex-col gap-2 min-w-[160px] animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <div className="px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border/50">
                        Design Controls
                    </div>

                    <div className="p-2 space-y-3">
                        <div className="space-y-1">
                            <label className="text-xs text-foreground font-medium">Theme</label>
                            <div className="flex gap-1 bg-muted p-1 rounded-lg">
                                <button
                                    onClick={() => onThemeChange('light')}
                                    className={cn(
                                        "flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all",
                                        currentTheme === 'light' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    Light
                                </button>
                                <button
                                    onClick={() => onThemeChange('dark')}
                                    className={cn(
                                        "flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all",
                                        currentTheme === 'dark' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    Dark
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs text-foreground font-medium">Layout</label>
                            <div className="flex gap-1 bg-muted p-1 rounded-lg">
                                <button
                                    onClick={() => onViewChange('grid')}
                                    className={cn(
                                        "flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all flex justify-center",
                                        currentView === 'grid' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <Grid size={14} />
                                </button>
                                <button
                                    onClick={() => onViewChange('masonry')}
                                    className={cn(
                                        "flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all flex justify-center",
                                        currentView === 'masonry' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <LayoutDashboard size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center"
            >
                {isOpen ? <X size={24} /> : <Settings2 size={24} />}
            </button>
        </div>
    );
}
