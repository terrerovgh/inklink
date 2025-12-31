
import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, User } from 'lucide-react';

export interface ProjectMedia {
    type: 'image' | 'video';
    url: string;
}

export interface Project {
    id: string;
    title: string;
    description: string;
    artist: {
        name: string;
        avatar: string;
        location: string;
    };
    media: ProjectMedia[];
    tags: string[];
}

interface ProjectModalProps {
    project: Project | null;
    isOpen: boolean;
    onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, isOpen, onClose }) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    if (!isOpen || !project) return null;

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % project.media.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + project.media.length) % project.media.length);
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={handleBackdropClick}
        >
            <div className="relative w-full max-w-5xl bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl flex flex-col lg:flex-row max-h-[90vh]">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white backdrop-blur-md transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Media Carousel Section */}
                <div className="w-full lg:w-2/3 bg-black relative flex items-center justify-center h-[40vh] lg:h-[80vh]">
                    {project.media.length > 0 && (
                        <>
                            <div className="w-full h-full flex items-center justify-center">
                                {project.media[currentSlide].type === 'image' ? (
                                    <img
                                        src={project.media[currentSlide].url}
                                        alt={`Slide ${currentSlide + 1}`}
                                        className="max-h-full max-w-full object-contain"
                                    />
                                ) : (
                                    <video
                                        src={project.media[currentSlide].url}
                                        controls
                                        className="max-h-full max-w-full"
                                    />
                                )}
                            </div>

                            {/* Navigation Arrows */}
                            {project.media.length > 1 && (
                                <>
                                    <button
                                        onClick={prevSlide}
                                        className="absolute left-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white backdrop-blur-md transition-colors"
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                    <button
                                        onClick={nextSlide}
                                        className="absolute right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white backdrop-blur-md transition-colors"
                                    >
                                        <ChevronRight size={24} />
                                    </button>
                                </>
                            )}

                            {/* Dots Indicator */}
                            {project.media.length > 1 && (
                                <div className="absolute bottom-4 flex gap-2">
                                    {project.media.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentSlide(idx)}
                                            className={`w-2 h-2 rounded-full transition-all ${idx === currentSlide ? 'bg-white w-4' : 'bg-white/50'
                                                }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Info Section */}
                <div className="w-full lg:w-1/3 p-6 lg:p-8 overflow-y-auto bg-zinc-900">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-full bg-zinc-800 overflow-hidden shrink-0 border border-zinc-700">
                            {project.artist.avatar ? (
                                <img src={project.artist.avatar} alt={project.artist.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-500">
                                    <User size={24} />
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-lg">{project.artist.name}</h3>
                            <p className="text-zinc-400 text-sm">{project.artist.location}</p>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-4">{project.title}</h2>
                    <p className="text-zinc-300 mb-6 leading-relaxed">
                        {project.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-8">
                        {project.tags.map(tag => (
                            <span key={tag} className="px-3 py-1 bg-zinc-800 text-zinc-300 text-xs rounded-full border border-zinc-700">
                                #{tag}
                            </span>
                        ))}
                    </div>

                    <div className="mt-auto pt-6 border-t border-zinc-800">
                        <button className="w-full bg-white text-black font-bold py-3 px-4 rounded-lg hover:bg-zinc-200 transition-colors">
                            Book with Artist
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};
