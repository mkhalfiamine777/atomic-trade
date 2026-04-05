import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import L from 'leaflet'
import { Marker, Popup } from 'react-leaflet'
import { getProductIcon, getRequestIcon } from '@/utils/mapIcons'
import { Listing } from "@/types"
import { ChevronRight, ChevronLeft, Store, User as UserIcon } from 'lucide-react'
import { MapItem, getOffsetIcon } from './MapMarker'

export function ListingMarker({ item, position, onStartChat, onMouseEnter, onMouseLeave }: {
    item: MapItem
    position: [number, number]
    onStartChat: (listingId: string, sellerId: string, sellerName?: string | null) => void
    onMouseEnter?: () => void
    onMouseLeave?: () => void
}) {
    const [currentIndex, setCurrentIndex] = useState(0)

    const isGrouped = item.count && item.count > 1;
    const activeListing = (isGrouped && item.groupedData ? item.groupedData[currentIndex] : item.data) as Listing;
    const sellerName = activeListing.seller?.name || 'Unknown'

    const baseListing = item.data as Listing;
    const baseIcon = baseListing.type === 'PRODUCT' ? getProductIcon(item.count) : getRequestIcon(item.count);
    const icon = getOffsetIcon(baseIcon, item);

    const popupTitle = activeListing.type === 'PRODUCT' ? 'عرض جديد' : 'طلب جديد';

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (item.count && currentIndex < item.count - 1) setCurrentIndex(prev => prev + 1);
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
    };

    return (
        <Marker
            key={baseListing.id}
            position={position}
            icon={icon}
            eventHandlers={{ mouseover: onMouseEnter, mouseout: onMouseLeave }}
        >
            <Popup className="compact-popup" closeButton={true}>
                <div className="text-right min-w-[200px] max-w-[240px] p-3">
                    {/* Header: Navigation and Badge */}
                    <div className="flex justify-between items-center mb-2.5">
                        {isGrouped ? (
                            <div className="flex items-center gap-0.5 bg-white/[0.06] rounded-full px-1.5 py-0.5 border border-white/10" dir="ltr">
                                <button onClick={handlePrev} disabled={currentIndex === 0} className="p-0.5 hover:bg-white/10 rounded-full disabled:opacity-20 transition-colors">
                                    <ChevronLeft size={14} className="text-zinc-300" />
                                </button>
                                <span className="text-[10px] font-bold px-1.5 text-zinc-300">{currentIndex + 1} / {item.count}</span>
                                <button onClick={handleNext} disabled={currentIndex === (item.count! - 1)} className="p-0.5 hover:bg-white/10 rounded-full disabled:opacity-20 transition-colors">
                                    <ChevronRight size={14} className="text-zinc-300" />
                                </button>
                            </div>
                        ) : <div></div>}
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${activeListing.type === 'PRODUCT'
                            ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-300 border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                            : 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/30 shadow-[0_0_8px_rgba(168,85,247,0.2)]'
                            }`}>
                            {popupTitle}
                        </span>
                    </div>

                    {/* Image with Overlay */}
                    {activeListing.images && (
                        <div className="relative rounded-xl overflow-hidden mb-2.5 group h-28 w-full">
                            <Image src={activeListing.images.split(',')[0]} alt={activeListing.title || 'صورة'} fill className="object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            {activeListing.price && (
                                <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-md text-emerald-300 text-[11px] font-bold px-2 py-0.5 rounded-lg border border-emerald-500/30 shadow-[0_0_6px_rgba(16,185,129,0.2)]">
                                    {activeListing.price} د.م
                                </div>
                            )}
                        </div>
                    )}

                    {/* Title */}
                    <h3 className="font-bold text-sm text-white truncate mb-1">{activeListing.title}</h3>

                    {/* Seller Info */}
                    <div className="flex justify-start items-center mb-3">
                        {activeListing.seller?.username ? (
                            <Link onClick={(e) => e.stopPropagation()} href={`/u/${activeListing.seller.username}`} className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                                <UserIcon size={12} /> {sellerName}
                            </Link>
                        ) : (
                            <p className="text-xs flex items-center gap-1.5 text-zinc-400"><UserIcon size={12} /> {sellerName}</p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                        <button className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white px-3 py-2 rounded-xl text-xs w-full font-bold transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
                            onClick={(e) => { e.stopPropagation(); onStartChat(activeListing.id, activeListing.sellerId, sellerName); }}>
                            تواصل
                        </button>
                        {activeListing.seller?.username && (
                            <Link onClick={(e) => e.stopPropagation()} href={`/activity/${activeListing.seller.username}?tab=SALES`}
                                className="bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300 hover:text-white px-3 py-2 rounded-xl text-xs w-full flex justify-center items-center gap-1.5 border border-white/10 hover:border-white/20 transition-all font-medium">
                                <Store size={12} /> زيارة المتجر
                            </Link>
                        )}
                    </div>
                </div>
            </Popup>
        </Marker>
    )
}
