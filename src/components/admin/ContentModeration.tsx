import React, { useState } from 'react';
import type { FlashTattoo, Offer, Dossier } from '../../types/database';
import { actions } from 'astro:actions';
import { Trash2, AlertTriangle } from 'lucide-react';

interface ContentModerationProps {
    initialFlash: FlashTattoo[];
    initialOffers: Offer[];
    initialDossiers: Dossier[];
}

export default function ContentModeration({ initialFlash, initialOffers, initialDossiers }: ContentModerationProps) {
    const [activeTab, setActiveTab] = useState<'flash' | 'offers' | 'dossiers'>('flash');
    const [flash, setFlash] = useState(initialFlash);
    const [offers, setOffers] = useState(initialOffers);
    const [dossiers, setDossiers] = useState(initialDossiers);
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const isLoading = (id: string) => loadingId === id;

    const handleDelete = async (id: string, type: 'flash' | 'dossier' | 'offer') => {
        if (!confirm("Delete this content permanently?")) return;
        setLoadingId(id);
        const { error } = await actions.adminDeleteContent({ id, type });
        if (error) {
            alert(error.message);
        } else {
            if (type === 'flash') setFlash(flash.filter(i => i.id !== id));
            if (type === 'offer') setOffers(offers.filter(i => i.id !== id));
            if (type === 'dossier') setDossiers(dossiers.filter(i => i.id !== id));
        }
        setLoadingId(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 border-b border-border">
                {['flash', 'offers', 'dossiers'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${activeTab === tab
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeTab === 'flash' && flash.map(item => (
                    <div key={item.id} className="bg-card border border-border rounded-xl overflow-hidden group">
                        <div className="aspect-square relative">
                            <img src={item.image_url} className="w-full h-full object-cover" />
                            <button
                                onClick={() => handleDelete(item.id, 'flash')}
                                disabled={isLoading(item.id)}
                                className="absolute top-2 right-2 bg-destructive text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                            >
                                {isLoading(item.id) ? "..." : <Trash2 size={16} />}
                            </button>
                        </div>
                        <div className="p-3">
                            <h3 className="font-bold">{item.title}</h3>
                            <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                        </div>
                    </div>
                ))}

                {activeTab === 'offers' && offers.map(item => (
                    <div key={item.id} className="bg-card border border-border rounded-xl p-4 relative group">
                        <button
                            onClick={() => handleDelete(item.id, 'offer')}
                            disabled={isLoading(item.id)}
                            className="absolute top-2 right-2 text-destructive opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                        >
                            {isLoading(item.id) ? "..." : <Trash2 size={16} />}
                        </button>
                        <h3 className="font-bold">{item.title}</h3>
                        <div className="text-sm text-primary font-bold my-1">
                            {item.discount_percentage ? `${item.discount_percentage}% OFF` : ''}
                        </div>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                ))}

                {activeTab === 'dossiers' && dossiers.map(item => (
                    <div key={item.id} className="bg-card border border-border rounded-xl p-4 relative group">
                        <button
                            onClick={() => handleDelete(item.id, 'dossier')}
                            disabled={isLoading(item.id)}
                            className="absolute top-2 right-2 text-destructive opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                        >
                            {isLoading(item.id) ? "..." : <Trash2 size={16} />}
                        </button>
                        <h3 className="font-bold">{item.title}</h3>
                        <p className="text-xs uppercase font-semibold bg-muted inline-block px-1 rounded my-2">{item.status}</p>
                        <p className="text-sm text-muted-foreground line-clamp-3">{item.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
