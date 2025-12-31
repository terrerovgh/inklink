import React from 'react';
import { Newspaper } from 'lucide-react';

export default function BlogWidget({ posts }: { posts: any[] }) {
    return (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col h-full md:col-span-2 lg:col-span-1">
            <div className="flex flex-row items-center justify-between pb-4">
                <h3 className="text-lg font-semibold tracking-tight">Latest News</h3>
                <Newspaper className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="space-y-4">
                {posts.slice(0, 3).map((post) => (
                    <a key={post.id} href={`/blog/${post.slug}`} className="flex gap-4 group hover:bg-accent/50 p-2 -mx-2 rounded-lg transition-colors">
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                            {post.image_url && (
                                <img src={post.image_url} alt={post.title} className="h-full w-full object-cover" />
                            )}
                        </div>
                        <div className="flex flex-col justify-center">
                            <h4 className="text-sm font-medium group-hover:text-primary leading-tight">{post.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{post.excerpt}</p>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}
