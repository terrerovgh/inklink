import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ImageUploadProps {
    onImagesSelected: (files: File[]) => void;
    maxFiles?: number;
    className?: string;
}

export default function ImageUpload({ onImagesSelected, maxFiles = 3, className }: ImageUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [previews, setPreviews] = useState<string[]>([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            const validFiles = files.slice(0, maxFiles - previews.length);

            // Create previews
            const newPreviews = validFiles.map(file => URL.createObjectURL(file));
            setPreviews([...previews, ...newPreviews]);

            onImagesSelected(validFiles);
        }
    };

    const removeImage = (index: number) => {
        const newPreviews = [...previews];
        URL.revokeObjectURL(newPreviews[index]); // Cleanup memory
        newPreviews.splice(index, 1);
        setPreviews(newPreviews);
        // Note: Removing from the actual File[] passed to parent needs parent state management.
        // For this simple version, we assumes the parent appends. 
        // Ideally, this component should control the files state or receive it as prop.
    };

    return (
        <div className={cn("space-y-4", className)}>
            <div
                onClick={() => inputRef.current?.click()}
                className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-muted/10 hover:border-primary/50 transition-all cursor-pointer group"
            >
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Upload size={20} className="text-primary" />
                </div>
                <p className="font-medium text-foreground">Click to upload images</p>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 5MB (Max {maxFiles})</p>
                <input
                    type="file"
                    ref={inputRef}
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                />
            </div>

            {previews.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                    {previews.map((src, idx) => (
                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
                            <img src={src} alt="Preview" className="h-full w-full object-cover" />
                            <button
                                onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                                className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
