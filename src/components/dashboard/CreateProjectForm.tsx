import React, { useState } from 'react';
import { actions } from 'astro:actions';
import ImageUpload from '../ui/ImageUpload';
import { supabase } from '../../lib/supabase';

export default function CreateProjectForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        body_zone: 'Arm',
        budget_min: 100,
        budget_max: 500,
    });

    const handleUpload = async (userId: string) => {
        const urls: string[] = [];
        for (const file of files) {
            const fileName = `${userId}/${Math.random().toString(36).substring(2)}.${file.name.split('.').pop()}`;
            const { error } = await supabase.storage.from('dossiers').upload(fileName, file);
            if (!error) {
                const { data } = supabase.storage.from('dossiers').getPublicUrl(fileName);
                urls.push(data.publicUrl);
            }
        }
        return urls;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Please log in");

            const imageUrls = await handleUpload(user.id);

            const { data, error } = await actions.createDossier({
                ...formData,
                studio_id: undefined, // Public Project
                concept_images: imageUrls
            });

            if (error) {
                alert("Error: " + error.message);
            } else {
                alert("Project posted successfully! Artists can now contact you.");
                setFormData({ title: '', description: '', body_zone: 'Arm', budget_min: 100, budget_max: 500 });
                setFiles([]);
            }
        } catch (e: any) {
            alert(e.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            <div className="space-y-2">
                <label className="text-sm font-medium">Project Title</label>
                <input
                    type="text"
                    className="w-full p-3 rounded-lg bg-background border border-input"
                    placeholder="e.g., Japanese Dragon Sleeve"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Placement</label>
                <select
                    className="w-full p-3 rounded-lg bg-background border border-input"
                    value={formData.body_zone}
                    onChange={(e) => setFormData({ ...formData, body_zone: e.target.value })}
                >
                    <option value="Arm">Arm</option>
                    <option value="Leg">Leg</option>
                    <option value="Chest">Chest</option>
                    <option value="Back">Back</option>
                    <option value="Other">Other</option>
                </select>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Budget Range ($)</label>
                <div className="flex gap-4">
                    <input
                        type="number"
                        className="w-full p-3 rounded-lg bg-background border border-input"
                        placeholder="Min"
                        value={formData.budget_min}
                        onChange={(e) => setFormData({ ...formData, budget_min: Number(e.target.value) })}
                    />
                    <input
                        type="number"
                        className="w-full p-3 rounded-lg bg-background border border-input"
                        placeholder="Max"
                        value={formData.budget_max}
                        onChange={(e) => setFormData({ ...formData, budget_max: Number(e.target.value) })}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                    className="w-full p-3 rounded-lg bg-background border border-input h-32"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Reference Images</label>
                <ImageUpload onImagesSelected={setFiles} maxFiles={3} />
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 transition-opacity"
            >
                {isSubmitting ? "Posting..." : "Post Project"}
            </button>
        </form>
    );
}
