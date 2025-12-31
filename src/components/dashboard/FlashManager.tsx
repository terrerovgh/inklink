import React, { useState } from 'react';
import type { FlashTattoo } from '../../types/database';
import { actions } from 'astro:actions';
import ImageUpload from '../ui/ImageUpload';
import { supabase } from '../../lib/supabase';

interface FlashManagerProps {
    initialItems: FlashTattoo[];
}

export default function FlashManager({ initialItems }: FlashManagerProps) {
    const [items, setItems] = useState<FlashTattoo[]>(initialItems);
    const [isCreating, setIsCreating] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        image_url: ''
    });

    const handleImageSelect = async (files: File[]) => {
        if (files.length === 0) return;
        setUploading(true);
        const file = files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `flash/${Math.random().toString(36).substring(2)}.${fileExt}`;

        // Assume 'flash' bucket exists, user should ensure policy
        const { data, error } = await supabase.storage
            .from('portfolios') // Reusing portfolios bucket? Or generic? prompt said "flash available". 
            // In schema discussion we assumed buckets. Let's use 'portfolios' as it is likely existing or 'public'.
            // Actually let's try 'flash' if fails fallback. But 'portfolios' is safer if exists.
            // Let's use 'dossiers' or 'portfolios'. 'portfolios' seems appropriate for artist work.
            .upload(fileName, file);

        if (error) {
            alert("Upload failed: " + error.message);
            setUploading(false);
            return;
        }

        const { data: { publicUrl } } = supabase.storage.from('portfolios').getPublicUrl(fileName);
        setFormData(prev => ({ ...prev, image_url: publicUrl }));
        setUploading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.image_url) {
            alert("Please upload an image");
            return;
        }

        const { data, error } = await actions.createFlash({
            title: formData.title,
            description: formData.description,
            price: Number(formData.price),
            image_url: formData.image_url
        });

        if (error) {
            alert("Error: " + error.message);
        } else {
            setItems([data as FlashTattoo, ...items]);
            setIsCreating(false);
            setFormData({ title: '', description: '', price: '', image_url: '' });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">My Flash</h2>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold"
                >
                    {isCreating ? "Cancel" : "Add Flash"}
                </button>
            </div>

            {isCreating && (
                <div className="bg-card border border-border p-6 rounded-xl animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-lg font-bold mb-4">Add New Flash</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Title</label>
                            <input
                                type="text"
                                className="w-full p-2 rounded bg-background border border-input"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Price ($)</label>
                            <input
                                type="number"
                                className="w-full p-2 rounded bg-background border border-input"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea
                                className="w-full p-2 rounded bg-background border border-input"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Image</label>
                            <ImageUpload onImagesSelected={handleImageSelect} maxFiles={1} />
                            {uploading && <p className="text-sm text-muted-foreground mt-2">Uploading...</p>}
                            {formData.image_url && (
                                <img src={formData.image_url} alt="Preview" className="w-32 h-32 object-cover rounded mt-2 border border-border" />
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={uploading}
                            className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-bold hover:opacity-90"
                        >
                            Publish Flash
                        </button>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {items.map(item => (
                    <div key={item.id} className="bg-card border border-border rounded-xl overflow-hidden">
                        <img src={item.image_url} alt={item.title} className="w-full aspect-square object-cover" />
                        <div className="p-4">
                            <h3 className="font-bold">{item.title}</h3>
                            <p className="text-sm text-muted-foreground">${item.price}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
