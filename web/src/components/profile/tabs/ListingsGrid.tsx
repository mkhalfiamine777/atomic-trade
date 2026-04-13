import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingBag, Megaphone, Clock } from 'lucide-react'
import { TabListing } from '@/types'
import { EmptyState } from './EmptyState'

interface ListingsGridProps {
    items: TabListing[]
    type: 'PRODUCT' | 'REQUEST'
    isOwner?: boolean
}

export function ListingsGrid({ items, type, isOwner }: ListingsGridProps) {
    // حساب الأيام في المتصفح فقط
    const [now, setNow] = useState<number | null>(null)
    useEffect(() => {
        setNow(Date.now())
    }, [items])

    if (items.length === 0) return <EmptyState label={type === 'PRODUCT' ? 'الرف فارغ حالياً' : 'لا توجد طلبات شراء'} />

    return (
        <div className="grid grid-cols-2 gap-3 px-2 place-items-center">
            {items.map(item => {
                const isSold = item.isSold
                let daysTarget = 0
                if (isSold && item.soldAt && now) {
                    const soldDate = new Date(item.soldAt).getTime()
                    const daysSince = (now - soldDate) / (1000 * 60 * 60 * 24)
                    daysTarget = Math.max(0, 7 - Math.floor(daysSince))
                }

                return (
                    <div key={item.id} className="relative pb-3 flex flex-col w-full max-w-[200px]">
                        <Link
                            href={`/l/${item.id}`}
                            className={`bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 flex flex-col transition-all duration-300 group ${isSold ? 'opacity-80 grayscale-[30%] border-red-900/40' : 'hover:border-zinc-500 shadow-[0_10px_20px_-10px_rgba(255,255,255,0.02)] hover:shadow-[0_10px_30px_-5px_rgba(255,255,255,0.08)] hover:-translate-y-1'}`}
                        >
                            <div className="aspect-[4/3] bg-zinc-800 relative overflow-hidden">
                                <div className="w-full h-full flex items-center justify-center text-zinc-600 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1">
                                    {item.images ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={item.images.split(',')[0]} alt={item.title} className="w-full h-full object-cover" />
                                    ) : (
                                        type === 'PRODUCT' ? <ShoppingBag /> : <Megaphone />
                                    )}
                                </div>
                                {type === 'PRODUCT' && !isSold && (
                                    <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded shadow-lg border border-white/10">
                                        {item.price} د.م
                                    </div>
                                )}
                                
                                {/* إشعار الـمـبـــاع */}
                                {isSold && (
                                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
                                        <div className="border border-red-500/50 bg-red-500/20 text-red-500 font-extrabold px-6 py-2 rounded shadow-2xl backdrop-blur-md transform -rotate-12 scale-110 tracking-widest text-lg shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                                            مُبـــــاع
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="p-3 bg-gradient-to-b from-zinc-900 to-zinc-950">
                                <h4 className={`text-xs sm:text-sm font-bold line-clamp-1 mb-1 ${isSold ? 'text-zinc-400 line-through decoration-red-500/50' : 'text-zinc-100'}`}>{item.title}</h4>
                                <div className={`w-full text-[10px] sm:text-xs py-2 rounded transition-colors text-center mt-2 font-medium ${isSold ? 'bg-zinc-900 text-zinc-600' : 'bg-zinc-800 hover:bg-zinc-700 text-white'}`}>
                                    {isSold ? 'غير متوفر' : 'التفاصيل'}
                                </div>
                            </div>
                        </Link>
                        
                        {/* Shelf Glow Design - خطوط الرف المضائة */}
                        <div className="absolute bottom-0 inset-x-2 h-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent blur-[2px] rounded-full" />
                        <div className="absolute bottom-0.5 inset-x-1 h-[2px] bg-gradient-to-r from-transparent via-zinc-400 to-transparent opacity-80" />
                        
                        {/* Sold Countdown for Owner */}
                        {isSold && isOwner && now !== null && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-red-950/90 border border-red-500 text-red-400 text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full shadow-lg z-10 w-max font-medium">
                                <Clock className="w-3 h-3" />
                                <span>يختفي بعد {daysTarget} أيام</span>
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
