import React, { useState } from 'react'
import Link from 'next/link'
import L from 'leaflet'
import { Marker, Popup } from 'react-leaflet'
import { getShopIcon, getRequestIcon } from '@/utils/mapIcons'
import { Listing, Story, Post } from "@/types"
import { ChevronRight, ChevronLeft, Store, User as UserIcon } from 'lucide-react'

export type MapItem = {
    type: 'LISTING' | 'STORY' | 'POST'
    data: Listing | Story | Post
    lat: number
    lng: number
    id: string
    offsetX?: number
    offsetY?: number
    count?: number
    groupedData?: any[]
}

// Helper to shift icons visually using screen pixels instead of geo-coordinates
const getOffsetIcon = (baseIcon: L.DivIcon, item: MapItem) => {
    if (!item.offsetX && !item.offsetY) return baseIcon;

    const options = { ...baseIcon.options };

    if (options.iconAnchor) {
        options.iconAnchor = [
            (options.iconAnchor as [number, number])[0] - (item.offsetX || 0),
            (options.iconAnchor as [number, number])[1] - (item.offsetY || 0)
        ];
    }

    if (options.popupAnchor) {
        options.popupAnchor = [
            (options.popupAnchor as [number, number])[0] + (item.offsetX || 0),
            (options.popupAnchor as [number, number])[1] + (item.offsetY || 0)
        ];
    }

    return L.divIcon(options);
}

interface MapMarkerProps {
    item: MapItem
    position: [number, number]
    onStartChat: (listingId: string, sellerId: string, sellerName?: string | null) => void
    onViewStory?: (story: Story) => void
}

export function MapMarker({ item, position, onStartChat, onViewStory }: MapMarkerProps) {
    const [currentIndex, setCurrentIndex] = useState(0)

    if (item.type === 'LISTING') {
        const isGrouped = item.count && item.count > 1;
        const activeListing = (isGrouped && item.groupedData ? item.groupedData[currentIndex] : item.data) as Listing;
        const sellerName = activeListing.seller?.name || 'Unknown'

        // Determine the base icon type (only computed ONCE for the group wrapper)
        const baseListing = item.data as Listing;
        const baseIcon = baseListing.type === 'PRODUCT' ? getShopIcon(false, true, item.count) : getRequestIcon(item.count);
        const icon = getOffsetIcon(baseIcon, item);

        const popupTitle = activeListing.type === 'PRODUCT' ? 'عرض جديد' : 'طلب جديد';

        const handleNext = (e: React.MouseEvent) => {
            e.stopPropagation();
            if (item.count && currentIndex < item.count - 1) {
                setCurrentIndex(prev => prev + 1);
            }
        };

        const handlePrev = (e: React.MouseEvent) => {
            e.stopPropagation();
            if (currentIndex > 0) {
                setCurrentIndex(prev => prev - 1);
            }
        };

        return (
            <Marker key={baseListing.id} position={position} icon={icon}>
                <Popup className="compact-popup">
                    <div className="text-right min-w-[180px]">

                        {/* 🌟 Header: Navigation and Title */}
                        <div className="flex justify-between items-center mb-2 border-b border-zinc-200 dark:border-zinc-800 pb-1">
                            {isGrouped ? (
                                <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-md px-1" dir="ltr">
                                    <button onClick={handlePrev} disabled={currentIndex === 0} className="p-0.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded disabled:opacity-30 disabled:hover:bg-transparent">
                                        <ChevronLeft size={16} />
                                    </button>
                                    <span className="text-[10px] font-bold px-1">{currentIndex + 1} / {item.count}</span>
                                    <button onClick={handleNext} disabled={currentIndex === (item.count! - 1)} className="p-0.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded disabled:opacity-30 disabled:hover:bg-transparent">
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            ) : <div></div>}
                            <span className="font-bold text-xs text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full">
                                {popupTitle}
                            </span>
                        </div>

                        {/* 🖼️ Content */}
                        {activeListing.images && (
                            <img
                                src={activeListing.images.split(',')[0]}
                                alt={activeListing.title}
                                className="w-full h-24 object-cover rounded-md mb-2"
                            />
                        )}
                        <h3 className="font-bold text-sm truncate">{activeListing.title}</h3>

                        {/* 👤 Seller Info */}
                        <div className="flex justify-start items-center mb-2 mt-1">
                            {activeListing.seller?.username ? (
                                <Link onClick={(e) => e.stopPropagation()} href={`/u/${activeListing.seller.username}`} className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                                    <UserIcon size={12} /> {sellerName}
                                </Link>
                            ) : (
                                <p className="text-xs flex items-center gap-1 text-zinc-500"><UserIcon size={12} /> {sellerName}</p>
                            )}
                        </div>

                        {/* 🔘 Action Buttons */}
                        <div className="flex flex-col gap-1.5 mt-2">
                            <button className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs w-full hover:bg-blue-700 transition"
                                onClick={(e) => { e.stopPropagation(); onStartChat(activeListing.id, activeListing.sellerId, sellerName); }}>
                                تواصل
                            </button>

                            {activeListing.seller?.username && (
                                <Link
                                    onClick={(e) => e.stopPropagation()}
                                    href={`/u/${activeListing.seller.username}?tab=SALES`}
                                    className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-3 py-1.5 rounded text-xs w-full flex justify-center items-center gap-1 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
                                >
                                    <Store size={12} /> زيارة المتجر
                                </Link>
                            )}
                        </div>
                    </div>
                </Popup>
            </Marker>
        )
    }

    if (item.type === 'STORY' && 'mediaType' in item.data) {
        const story = item.data as Story
        const isLive = story.user?.type === 'INDIVIDUAL'
        const isVideo = story.mediaType === 'VIDEO'
        const borderColor = isVideo ? 'border-pink-500' : 'border-cyan-400'

        const badgeHTML = (item.count && item.count > 1) ? `<div class="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-md z-50">${item.count}</div>` : '';

        // Creating a custom icon for the story (Avatar with border)
        const iconHtml = `
            <div class="relative w-8 h-8">
                <div class="absolute inset-0 rounded-full border-2 ${isLive ? `${borderColor} animate-pulse` : borderColor} overflow-hidden bg-black">
                    <img src="${story.user?.avatarUrl || '/placeholder-user.jpg'}" class="w-full h-full object-cover" />
                </div>
                ${isLive ? '<div class="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>' : ''}
                ${badgeHTML}
            </div>
        `

        const customIcon = L.divIcon({
            className: 'custom-story-marker',
            html: iconHtml,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            popupAnchor: [0, -16]
        })

        const finalIcon = getOffsetIcon(customIcon, item);

        return (
            <Marker
                key={story.id}
                position={position}
                icon={finalIcon}
                eventHandlers={{
                    click: () => onViewStory?.(story)
                }}
            >
                <Popup>
                    <div className="text-center cursor-pointer" onClick={() => onViewStory?.(story)}>
                        <h3 className="font-bold text-sm">قصة {story.user?.name}</h3>
                        <p className="text-xs text-blue-500">اضغط للمشاهدة</p>
                        {item.count && item.count > 1 && (
                            <p className="text-xs text-orange-500 font-bold mt-1">+ {item.count - 1} قصص أخرى</p>
                        )}
                    </div>
                </Popup>
            </Marker>
        )
    }

    return null
}
