import React, { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '../../../lib/utils';
import { X, GripVertical } from 'lucide-react';

interface PortfolioItem {
    id: string; // URL or unique ID
    url: string;
    style?: { id: string; name: string };
    title?: string;
}

interface PortfolioGridProps {
    initialImages?: string[]; // Deprecated, use items
    items?: PortfolioItem[];
    availableStyles?: string[];
    editable?: boolean;
    onSave?: (newOrder: string[]) => void;
}

function SortableItem({ id, url, editable, onRemove }: { id: string, url: string, editable?: boolean, onRemove?: () => void }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="relative group aspect-square rounded-xl overflow-hidden bg-muted shadow-sm hover:shadow-md transition-shadow">
            <img src={url} alt="Portfolio" className="h-full w-full object-cover" />

            {editable && (
                <>
                    <div {...attributes} {...listeners} className="absolute top-2 left-2 p-1.5 bg-black/50 backdrop-blur-md rounded-md cursor-grab active:cursor-grabbing text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <GripVertical size={16} />
                    </div>
                    {onRemove && (
                        <button
                            onClick={onRemove}
                            className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-600 backdrop-blur-md rounded-md text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X size={16} />
                        </button>
                    )}
                </>
            )}
        </div>
    );
}

export default function PortfolioGrid({ initialImages = [], items: initialItems, availableStyles = [], editable = false, onSave }: PortfolioGridProps) {
    // Map URLs to objects with ID for DnD if items not provided
    const [items, setItems] = useState<PortfolioItem[]>(
        initialItems || initialImages.map((url, index) => ({ id: `${index}-${url}`, url }))
    );
    const [activeFilter, setActiveFilter] = useState<string>('All');

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: any) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.findIndex(i => i.id === active.id);
                const newIndex = items.findIndex(i => i.id === over.id);
                const newOrder = arrayMove(items, oldIndex, newIndex);
                if (onSave) onSave(newOrder.map(i => i.url));
                return newOrder;
            });
        }
    };

    const handleRemove = (id: string) => {
        const newItems = items.filter(i => i.id !== id);
        setItems(newItems);
        if (onSave) onSave(newItems.map(i => i.url));
    };

    const filteredItems = activeFilter === 'All'
        ? items
        : items.filter(item => item.style?.name === activeFilter);

    if (!editable) {
        return (
            <div className="space-y-6">
                {/* Filter Tabs */}
                {availableStyles.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setActiveFilter('All')}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                                activeFilter === 'All'
                                    ? "bg-white text-black font-bold"
                                    : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
                            )}
                        >
                            All Works
                        </button>
                        {availableStyles.map(style => (
                            <button
                                key={style}
                                onClick={() => setActiveFilter(style)}
                                className={cn(
                                    "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                                    activeFilter === style
                                        ? "bg-white text-black font-bold"
                                        : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
                                )}
                            >
                                {style}
                            </button>
                        ))}
                    </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {filteredItems.map((item) => (
                        <div key={item.id} className="group relative aspect-square rounded-2xl overflow-hidden bg-muted cursor-zoom-in">
                            <img
                                src={item.url}
                                alt={item.title || "Portfolio"}
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 text-white font-medium px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-2">
                                        View Art
                                    </div>
                                    {item.style && (
                                        <span className="text-xs text-white/80 font-medium uppercase tracking-wider">{item.style.name}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map(i => i.id)} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {items.map((item) => (
                        <SortableItem
                            key={item.id}
                            id={item.id}
                            url={item.url}
                            editable={editable}
                            onRemove={() => handleRemove(item.id)}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}
