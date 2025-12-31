import React, { useState } from 'react';
import type { Studio } from '../../types/database';
import { actions } from 'astro:actions';
import { CheckCircle, XCircle } from 'lucide-react';

interface StudioTableProps {
    initialStudios: Studio[];
}

export default function StudioTable({ initialStudios }: StudioTableProps) {
    const [studios, setStudios] = useState<Studio[]>(initialStudios);
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const togglePremium = async (studioId: string, currentStatus: boolean) => {
        if (!confirm(`Are you sure you want to ${currentStatus ? 'revoke' : 'grant'} premium status for this studio?`)) return;
        setLoadingId(studioId);
        const { data, error } = await actions.adminToggleStudioPremium({
            studio_id: studioId,
            is_premium: !currentStatus
        });

        if (error) {
            alert(error.message);
        } else {
            setStudios(studios.map(s => s.id === studioId ? { ...s, is_premium: !currentStatus } : s));
        }
        setLoadingId(null);
    };

    return (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground font-medium">
                        <tr>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Location</th>
                            <th className="px-6 py-3">Verification</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {studios.map(studio => (
                            <tr key={studio.id} className="hover:bg-muted/30 transition-colors">
                                <td className="px-6 py-4 font-medium text-foreground">
                                    {studio.name}
                                </td>
                                <td className="px-6 py-4 text-muted-foreground">
                                    {studio.city}, {studio.country}
                                </td>
                                <td className="px-6 py-4">
                                    {studio.is_premium ? (
                                        <span className="inline-flex items-center gap-1 text-blue-500 font-medium bg-blue-500/10 px-2 py-1 rounded text-xs">
                                            <CheckCircle size={14} /> Premium
                                        </span>
                                    ) : (
                                        <span className="text-muted-foreground text-xs">Standard</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => togglePremium(studio.id, studio.is_premium || false)}
                                        disabled={loadingId === studio.id}
                                        className={`text-xs font-bold px-3 py-1 rounded transition-colors ${studio.is_premium
                                            ? "bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                            : "bg-primary text-primary-foreground hover:opacity-90"
                                            }`}
                                    >
                                        {studio.is_premium ? "Revoke Premium" : "Make Premium"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
