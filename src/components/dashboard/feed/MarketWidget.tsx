import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export default function MarketWidget({ listings }: { listings: any[] }) {
    return (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col h-full">
            <div className="flex flex-row items-center justify-between pb-4">
                <h3 className="text-lg font-semibold tracking-tight">Tattoo Market</h3>
                <a href="/market" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
                    View All <ArrowUpRight className="h-3 w-3" />
                </a>
            </div>

            <div className="space-y-4 flex-1">
                {listings.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No active requests found.</p>
                ) : (
                    listings.slice(0, 3).map((item) => (
                        <div key={item.id} className="group relative flex flex-col gap-2 rounded-lg border p-3 hover:bg-accent/50 transition-colors">
                            <div className="flex justify-between items-start">
                                <h4 className="font-medium text-sm">{item.title}</h4>
                                <span className="text-xs font-mono text-green-600 dark:text-green-400">
                                    ${item.budget_min}-${item.budget_max}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                        </div>
                    ))
                )}
            </div>

            <button className="mt-4 w-full rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                Browse Requests
            </button>
        </div>
    );
}
