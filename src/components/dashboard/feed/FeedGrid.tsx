import React from 'react';

interface FeedGridProps {
    children: React.ReactNode;
}

export default function FeedGrid({ children }: FeedGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min">
            {children}
        </div>
    );
}
