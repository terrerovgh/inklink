import React, { useState } from 'react';
import type { Offer } from '../../types/database';
import { actions } from 'astro:actions';
import ImageUpload from '../ui/ImageUpload';
import { supabase } from '../../lib/supabase';

interface OfferManagerProps {
    initialItems: Offer[];
}

export default function OfferManager({ initialItems }: OfferManagerProps) {
    const [items, setItems] = useState<Offer[]>(initialItems);
    const [isCreating, setIsCreating] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        discount_percentage: '',
        image_url: ''
    });

    const handleImageSelect = async (files: File[]) => {
        if (files.length === 0) return;
        setUploading(true);
        const file = files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `offers/${Math.random().toString(36).substring(2)}.${fileExt}`;

        // Use 'portfolios' bucket or similar
        const { data, error } = await supabase.storage
            .from('portfolios')
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

        const { data, error } = await actions.createOffer({
            title: formData.title,
            description: formData.description,
            price: formData.price ? Number(formData.price) : undefined,
            discount_percentage: formData.discount_percentage ? Number(formData.discount_percentage) : undefined,
            image_url: formData.image_url || undefined
        });

        if (error) {
            alert("Error: " + error.message);
        } else {
            setItems([data as Offer, ...items]);
            setIsCreating(false);
            setFormData({ title: '', description: '', price: '', discount_percentage: '', image_url: '' });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">My Offers</h2>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold"
                >
                    {isCreating ? "Cancel" : "Add Offer"}
                </button>
            </div>

            {isCreating && (
                <div className="bg-card border border-border p-6 rounded-xl animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-lg font-bold mb-4">Create Special Offer</h3>
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
                        <div className="grid grid-cols-2 gap-4">
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
                                <label className="block text-sm font-medium mb-1">Discount (%)</label>
                                <input
                                    type="number"
                                    className="w-full p-2 rounded bg-background border border-input"
                                    value={formData.discount_percentage}
                                    onChange={e => setFormData({ ...formData, discount_percentage: e.target.value })}
                                />
                            </div>
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
                            <label className="block text-sm font-medium mb-1">Image (Optional)</label>
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
                            Publish Offer
                        </button>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {items.map(item => (
                    <div key={item.id} className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors">
                        <div className="flex gap-4">
                            {item.image_url && (
                                <img src={item.image_url} alt={item.title} className="w-24 h-24 object-cover rounded-lg" />
                            )}
                            <div>
                                <h3 className="font-bold text-lg">{item.title}</h3>
                                <div className="text-sm text-primary font-bold mb-1">
                                    {item.discount_percentage ? `${item.discount_percentage}% OFF` : ''}
                                    {item.price ? ` $${item.price}` : ''}
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
