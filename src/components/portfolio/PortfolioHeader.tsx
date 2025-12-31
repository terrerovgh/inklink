import React from 'react';
import { Instagram, Globe, Mail, MapPin } from 'lucide-react';

interface PortfolioHeaderProps {
    artist: {
        name: string;
        role: string;
        avatar_url: string;
        bio: string;
        instagram?: string;
        website?: string;
        email?: string;
    };
}

export default function PortfolioHeader({ artist }: PortfolioHeaderProps) {
    return (
        <header className="flex flex-col items-center text-center md:flex-row md:text-left md:items-start md:gap-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="relative group mb-6 md:mb-0 shrink-0">
                <div className="h-32 w-32 md:h-48 md:w-48 rounded-full overflow-hidden border-4 border-muted/20 shadow-2xl relative z-10 transition-transform duration-500 group-hover:scale-105">
                    <img
                        src={artist.avatar_url}
                        alt={artist.name}
                        className="h-full w-full object-cover"
                    />
                </div>
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl -z-10 group-hover:bg-primary/30 transition-colors duration-500"></div>
            </div>

            <div className="flex-1 space-y-4 max-w-lg">
                <div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-2">{artist.name}</h1>
                    <p className="text-lg text-primary font-medium tracking-wide uppercase opacity-90">{artist.role}</p>
                </div>

                <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
                    {artist.bio}
                </p>

                <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-6">
                    {artist.instagram && (
                        <a href={artist.instagram} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 hover:bg-secondary text-secondary-foreground transition-all hover:scale-105 active:scale-95">
                            <Instagram size={18} />
                            <span className="text-sm font-medium">Instagram</span>
                        </a>
                    )}
                    {artist.website && (
                        <a href={artist.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 hover:bg-secondary text-secondary-foreground transition-all hover:scale-105 active:scale-95">
                            <Globe size={18} />
                            <span className="text-sm font-medium">Website</span>
                        </a>
                    )}
                    <a href={`mailto:${artist.email || 'contact@inklink.com'}`} className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-105 active:scale-95">
                        <Mail size={18} />
                        <span>Book Now</span>
                    </a>
                </div>
            </div>
        </header>
    );
}
