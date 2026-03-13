import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import L from 'leaflet'
import { Marker, Popup } from 'react-leaflet'
import { getShopIcon, getRequestIcon, getIndividualIcon, getCompanyIcon } from '@/utils/mapIcons'
import { Listing, Story, Post, LocationUser } from "@/types"
import { ChevronRight, ChevronLeft, Store, User as UserIcon, MessageCircle, Building2 } from 'lucide-react'

export type MapItem = {
    type: 'LISTING' | 'STORY' | 'POST' | 'USER'
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
    onMouseEnter?: () => void
    onMouseLeave?: () => void
}

export function MapMarker({ item, position, onStartChat, onViewStory, onMouseEnter, onMouseLeave }: MapMarkerProps) {
    const [currentIndex, setCurrentIndex] = useState(0)

    if (item.type === 'LISTING') {
        const isGrouped = item.count && item.count > 1;
        const activeListing = (isGrouped && item.groupedData ? item.groupedData[currentIndex] : item.data) as Listing;
        const sellerName = activeListing.seller?.name || 'Unknown'

        // Determine the base icon type (only computed ONCE for the group wrapper)
        const baseListing = item.data as Listing;
        const baseIcon = baseListing.type === 'PRODUCT' ? getShopIcon(false, true, true, item.count) : getRequestIcon(item.count);
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
            <Marker
                key={baseListing.id}
                position={position}
                icon={icon}
                eventHandlers={{
                    mouseover: onMouseEnter,
                    mouseout: onMouseLeave
                }}
            >
                <Popup className="compact-popup" closeButton={true}>
                    <div className="text-right min-w-[200px] max-w-[240px] p-3">

                        {/* 🌟 Header: Navigation and Badge */}
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

                        {/* 🖼️ Image with Overlay */}
                        {activeListing.images && (
                            <div className="relative rounded-xl overflow-hidden mb-2.5 group h-28 w-full">
                                <Image
                                    src={activeListing.images.split(',')[0]}
                                    alt={activeListing.title || 'صورة'}
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                {activeListing.price && (
                                    <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-md text-emerald-300 text-[11px] font-bold px-2 py-0.5 rounded-lg border border-emerald-500/30 shadow-[0_0_6px_rgba(16,185,129,0.2)]">
                                        {activeListing.price} د.م
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 📝 Title */}
                        <h3 className="font-bold text-sm text-white truncate mb-1">{activeListing.title}</h3>

                        {/* 👤 Seller Info */}
                        <div className="flex justify-start items-center mb-3">
                            {activeListing.seller?.username ? (
                                <Link onClick={(e) => e.stopPropagation()} href={`/u/${activeListing.seller.username}`} className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                                    <UserIcon size={12} /> {sellerName}
                                </Link>
                            ) : (
                                <p className="text-xs flex items-center gap-1.5 text-zinc-400"><UserIcon size={12} /> {sellerName}</p>
                            )}
                        </div>

                        {/* 🔘 Action Buttons */}
                        <div className="flex flex-col gap-2">
                            <button className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white px-3 py-2 rounded-xl text-xs w-full font-bold transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
                                onClick={(e) => { e.stopPropagation(); onStartChat(activeListing.id, activeListing.sellerId, sellerName); }}>
                                تواصل
                            </button>

                            {activeListing.seller?.username && (
                                <Link
                                    onClick={(e) => e.stopPropagation()}
                                    href={`/activity/${activeListing.seller.username}?tab=SALES`}
                                    className="bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300 hover:text-white px-3 py-2 rounded-xl text-xs w-full flex justify-center items-center gap-1.5 border border-white/10 hover:border-white/20 transition-all font-medium"
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
                    <img src="${story.user?.avatarUrl || '/placeholder-user.jpg'}" class="w-full h-full object-cover" alt="${story.user?.name || 'قصة'}" />
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
                    click: () => onViewStory?.(story),
                    mouseover: onMouseEnter,
                    mouseout: onMouseLeave
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
    // 👤🏪🏢 USER type — Global users on the map
    if (item.type === 'USER') {
        const user = item.data as any as LocationUser
        const userType = (user.type || 'INDIVIDUAL') as string

        // Pick the correct neon icon based on user type
        const baseIcon = userType === 'SHOP'
            ? getShopIcon(false, true)
            : userType === 'COMPANY'
                ? getCompanyIcon(false, true)
                : getIndividualIcon(false, true)

        const finalIcon = getOffsetIcon(baseIcon, item)

        const typeLabel = userType === 'SHOP' ? '🏪 متجر' : userType === 'COMPANY' ? '🏢 شركة' : '👤 فرد'
        const typeColor = userType === 'SHOP' ? 'text-amber-500' : userType === 'COMPANY' ? 'text-purple-400' : 'text-blue-400'

        return (
            <Marker
                key={`user-${user.id}`}
                position={position}
                icon={finalIcon}
                eventHandlers={{
                    mouseover: onMouseEnter,
                    mouseout: onMouseLeave
                }}
            >
                <Popup>
                    <div className="text-right min-w-[160px] p-1" dir="rtl">
                        <div className="flex items-center gap-2 mb-2">
                            {user.avatarUrl ? (
                                <Image src={user.avatarUrl} width={32} height={32} className="rounded-full object-cover border-2 border-white shadow" alt={user.name || user.username || 'مستخدم'} />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center">
                                    <UserIcon size={16} className="text-zinc-400" />
                                </div>
                            )}
                            <div>
                                <h3 className="font-bold text-sm leading-tight">{user.name || user.username || 'مستخدم'}</h3>
                                <span className={`text-[10px] font-medium ${typeColor}`}>{typeLabel}</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            {user.username && (
                                <Link
                                    href={`/u/${user.username}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs w-full flex justify-center items-center gap-1 hover:bg-blue-700 transition"
                                >
                                    <UserIcon size={12} /> زيارة الملف
                                </Link>
                            )}
                            <button
                                className="bg-emerald-600 text-white px-3 py-1.5 rounded text-xs w-full flex justify-center items-center gap-1 hover:bg-emerald-700 transition"
                                onClick={(e) => { e.stopPropagation(); onStartChat(user.id, user.id, user.name); }}
                            >
                                <MessageCircle size={12} /> تواصل
                            </button>
                        </div>
                    </div>
                </Popup>
            </Marker>
        )
    }

    return null
}
