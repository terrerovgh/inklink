
import React, { useState } from 'react';
import { ProjectModal, type Project } from '../shared/ProjectModal';
import { MapPin } from 'lucide-react';



interface TattooFeedProps {
    initialProjects?: Project[];
}

export const TattooFeed = ({ initialProjects }: TattooFeedProps) => {
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    return (
        <section className="py-12 bg-zinc-50 dark:bg-zinc-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                    <div>
                        <span className="text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider text-sm mb-2 block">Discover</span>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white">Local Masterpieces</h2>
                        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl">
                            Explore the finest ink from Havana to Santiago. Curated projects from the island's top artists.
                        </p>
                    </div>
                    <a href="/explore" className="hidden sm:inline-flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-semibold transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-700">
                        View Gallery &rarr;
                    </a>
                </div>

                <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                    {(initialProjects || []).map((project) => (
                        <div
                            key={project.id}
                            onClick={() => setSelectedProject(project)}
                            className="break-inside-avoid mb-6 group relative aspect-[3/4] overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900 cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500"
                        >
                            <img
                                src={project.media[0].url}
                                alt={project.title}
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                            <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                <div className="transform transition-all duration-300 opacity-90 group-hover:opacity-100">
                                    <div className="flex flex-wrap gap-2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                                        {project.tags.slice(0, 2).map((tag) => (
                                            <span key={tag} className="inline-flex items-center rounded-full border border-transparent bg-white/20 backdrop-blur-sm px-2.5 py-0.5 text-xs font-semibold text-white transition-colors hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2 leading-tight">{project.title}</h3>
                                    <div className="flex items-center text-zinc-300 text-sm gap-3">
                                        <div className="w-8 h-8 rounded-full ring-2 ring-white/20 bg-zinc-800 overflow-hidden flex-shrink-0">
                                            <img src={project.artist.avatar} alt={project.artist.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-white">{project.artist.name}</span>
                                            <span className="flex items-center text-xs text-zinc-400">
                                                <MapPin size={10} className="mr-1" />
                                                {project.artist.location}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center sm:hidden">
                    <a href="/explore" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-semibold transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-700">
                        View Gallery &rarr;
                    </a>
                </div>
            </div>

            <ProjectModal
                project={selectedProject}
                isOpen={!!selectedProject}
                onClose={() => setSelectedProject(null)}
            />
        </section>
    );
};
