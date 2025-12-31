import React from 'react';
import { ShoppingBag } from 'lucide-react';

export default function ShopWidget({ products }: { products: any[] }) {
    return (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col h-full">
            <div className="flex flex-row items-center justify-between pb-4">
                <h3 className="text-lg font-semibold tracking-tight">Shop & Supplies</h3>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="grid grid-cols-2 gap-3 flex-1">
                {products.slice(0, 2).map((product) => (
                    <a key={product.id} href={product.store_url || '#'} className="group block space-y-2">
                        <div className="aspect-square overflow-hidden rounded-md bg-muted">
                            {product.image_url ? (
                                <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">No Image</div>
                            )}
                        </div>
                        <div>
                            <h4 className="text-xs font-medium truncate">{product.name}</h4>
                            <p className="text-xs text-muted-foreground">${(product.price / 100).toFixed(2)}</p>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}
