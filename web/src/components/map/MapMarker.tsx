import React from 'react'
import L from 'leaflet'
import { Marker, Popup } from 'react-leaflet'
import { Listing, Story, Post, LocationUser } from "@/types"
import { ListingMarker } from './ListingMarker'
import { UserMarker } from './UserMarker'

export type MapItem = {
    type: 'LISTING' | 'STORY' | 'POST' | 'USER'
    data: Listing | Story | Post | LocationUser
    lat: number
    lng: number
    id: string
    offsetX?: number
    offsetY?: number
    count?: number
    groupedData?: MapItem[]
}

// Helper to shift icons visually using screen pixels instead of geo-coordinates
export const getOffsetIcon = (baseIcon: L.DivIcon, item: MapItem) => {
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
    zIndexOffset?: number
    onStartChat: (listingId: string, sellerId: string, sellerName?: string | null) => void
    onViewStory?: (story: Story) => void
    onMouseEnter?: () => void
    onMouseLeave?: () => void
}

export function MapMarker({ item, position, zIndexOffset, onStartChat, onViewStory, onMouseEnter, onMouseLeave }: MapMarkerProps) {
    if (item.type === 'LISTING') {
        return <ListingMarker item={item} position={position} zIndexOffset={zIndexOffset} onStartChat={onStartChat} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} />
    }

    if (item.type === 'STORY' && 'mediaType' in item.data) {
        const story = item.data as Story
        const isLive = story.user?.type === 'INDIVIDUAL'
        const isVideo = story.mediaType === 'VIDEO'
        const borderColor = isVideo ? 'border-pink-500' : 'border-cyan-400'

        const badgeHTML = (item.count && item.count > 1) ? `<div class="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-md z-50">${item.count}</div>` : '';

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
                zIndexOffset={zIndexOffset}
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

    if (item.type === 'USER') {
        return <UserMarker item={item} position={position} zIndexOffset={zIndexOffset} onStartChat={onStartChat} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} />
    }

    return null
}
