import React from 'react'
import Link from 'next/link'
import { ShoppingBag, Megaphone } from 'lucide-react'
import { TabListing } from '@/types'
import { EmptyState } from './EmptyState'

interface ListingsGridProps {
    items: TabListing[]
    type: 'PRODUCT' | 'REQUEST'
}

export function ListingsGrid({ items, type }: ListingsGridProps) {
    if (items.length === 0) return <EmptyState label={type === 'PRODUCT' ? 'لا توجد منتجات معروضة' : 'لا توجد طلبات شراء'} />

    return (
        <div className="grid grid-cols-2 gap-3 px-2">
            {items.map(item => (
                <Link
                    href={`/l/${item.id}`}
                    key={item.id}
                    className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 flex flex-col hover:border-zinc-600 transition-colors group"
                >
                    <div className="aspect-[4/3] bg-zinc-800 relative overflow-hidden">
                        <div className="w-full h-full flex items-center justify-center text-zinc-600 group-hover:scale-105 transition-transform duration-500">
                            {item.images ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={item.images.split(',')[0]} alt={item.title} className="w-full h-full object-cover" />
                            ) : (
                                type === 'PRODUCT' ? <ShoppingBag /> : <Megaphone />
                            )}
                        </div>
                        {type === 'PRODUCT' && (
                            <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded shadow-lg">
                                {item.price} د.م
                            </div>
                        )}
                    </div>
                    <div className="p-3">
                        <h4 className="text-sm font-bold text-white line-clamp-1 mb-1">{item.title}</h4>
                        <div className="w-full bg-zinc-800 hover:bg-zinc-700 text-xs text-white py-2 rounded transition-colors text-center mt-2 font-medium">
                            التفاصيل
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    )
}
