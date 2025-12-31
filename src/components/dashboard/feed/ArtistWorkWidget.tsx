import React from 'react';
import { Zap } from 'lucide-react';

export default function ArtistWorkWidget({ works }: { works: any[] }) {
    return (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col h-full md:col-span-2">
            <div className="flex flex-row items-center justify-between pb-4">
                <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <h3 className="text-lg font-semibold tracking-tight">Fresh Ink Local</h3>
                </div>
                <span className="text-xs text-muted-foreground">Based on your location</span>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {works.length === 0 ? (
                    <div className="flex h-32 w-full items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                        No recent works nearby.
                    </div>
                ) : (
                    works.map((work) => (
                        <div key={work.id} className="relative aspect-[3/4] w-40 flex-shrink-0 overflow-hidden rounded-lg group cursor-pointer">
                            <img
                                src={work.image_url}
                                alt={work.title}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                <p className="text-white font-medium text-sm">{work.title}</p>
                                <p className="text-white/80 text-xs">${work.price}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
