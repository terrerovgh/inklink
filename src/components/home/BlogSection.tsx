import React from 'react';
import { ArrowRight, Calendar } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';

const MOCK_POSTS = [
    {
        id: 1,
        title: '5 Tips for Your First Tattoo Session',
        excerpt: 'Everything you need to know before getting inked for the first time, from hydration to clothing choices.',
        date: 'Dec 28, 2024',
        image: 'https://images.unsplash.com/photo-1590246130796-54238a2995bd?w=600&q=80',
        slug: '5-tips-first-tattoo'
    },
    {
        id: 2,
        title: 'The Rise of Fine Line Tattoos in Havana',
        excerpt: 'How local artists are mastering this delicate style and blending it with traditional Cuban imagery.',
        date: 'Dec 20, 2024',
        image: 'https://images.unsplash.com/photo-1562962230-16e4623d36e6?w=600&q=80',
        slug: 'fine-line-tattoos-havana'
    },
    {
        id: 3,
        title: 'Aftercare 101: Keeping Your Ink Fresh',
        excerpt: 'A comprehensive guide to tattoo aftercare to ensure your piece heals perfectly and stays vibrant.',
        date: 'Dec 15, 2024',
        image: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=600&q=80',
        slug: 'aftercare-101'
    }
];

export const BlogSection = () => {
    return (
        <section className="py-16 bg-white dark:bg-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-10">
                    <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">From the Blog</h2>
                    <Button variant="link" className="hidden sm:inline-flex items-center text-sm font-semibold text-zinc-900 dark:text-white hover:text-zinc-600 dark:hover:text-zinc-300 p-0" asChild>
                        <a href="/blog">
                            Read all articles <ArrowRight size={16} className="ml-1" />
                        </a>
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {MOCK_POSTS.map((post) => (
                        <Card key={post.id} className="group cursor-pointer border-none shadow-none bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors p-0 rounded-xl overflow-hidden">
                            <div className="relative w-full aspect-[16/9] overflow-hidden rounded-xl bg-gray-100 dark:bg-zinc-800">
                                <img
                                    src={post.image}
                                    alt={post.title}
                                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>
                            <CardContent className="p-4 pl-0">
                                <div className="flex items-center gap-2 text-xs text-zinc-500 mb-3">
                                    <Calendar size={12} />
                                    <span>{post.date}</span>
                                </div>
                                <CardTitle className="text-xl mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    <a href={`/blog/${post.slug}`} className="hover:underline decoration-transparent">
                                        {post.title}
                                    </a>
                                </CardTitle>
                                <CardDescription className="line-clamp-2">
                                    {post.excerpt}
                                </CardDescription>
                            </CardContent>
                            <CardFooter className="p-4 pl-0 pt-0">
                                <Button variant="link" className="p-0 h-auto text-blue-600 dark:text-blue-400 hover:underline" asChild>
                                    <a href={`/blog/${post.slug}`}>Read more</a>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                <div className="mt-8 text-center sm:hidden">
                    <Button variant="link" asChild>
                        <a href="/blog" className="flex items-center justify-center text-sm font-semibold text-zinc-900 dark:text-white">
                            Read all articles <ArrowRight size={16} className="ml-1" />
                        </a>
                    </Button>
                </div>
            </div>
        </section>
    );
};
