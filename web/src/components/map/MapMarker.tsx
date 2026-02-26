import React from 'react'
import Link from 'next/link'
import L from 'leaflet'
import { Marker, Popup } from 'react-leaflet'
import { getShopIcon, getRequestIcon } from '@/utils/mapIcons'
import { Listing, Story, Post } from "@/types"

export type MapItem = {
    type: 'LISTING' | 'STORY' | 'POST'
    data: Listing | Story | Post
    lat: number
    lng: number
    id: string
}

interface MapMarkerProps {
    item: MapItem
    position: [number, number]
    onStartChat: (listingId: string, sellerId: string, sellerName?: string | null) => void
    onViewStory?: (story: Story) => void
}

export function MapMarker({ item, position, onStartChat, onViewStory }: MapMarkerProps) {
    if (item.type === 'LISTING') {
        const listing = item.data as Listing
        const sellerName = listing.seller?.name || 'Unknown'

        return (
            <Marker key={listing.id} position={position} icon={listing.type === 'PRODUCT' ? getShopIcon(false, true) : getRequestIcon()}>
                <Popup className="compact-popup">
                    <div className="text-right min-w-[150px]">
                        {listing.images && (
                            <img
                                src={listing.images.split(',')[0]}
                                alt={listing.title}
                                className="w-full h-24 object-cover rounded-md mb-2"
                            />
                        )}
                        <h3 className="font-bold text-sm">{listing.title}</h3>
                        {listing.seller?.username ? (
                            <Link href={`/u/${listing.seller.username}`} className="text-xs text-blue-500 hover:underline block mb-2">
                                {sellerName}
                            </Link>
                        ) : (
                            <p className="text-xs mb-2">{sellerName}</p>
                        )}
                        <button className="bg-blue-600 text-white px-3 py-1 rounded text-xs w-full"
                            onClick={() => onStartChat(listing.id, listing.sellerId, sellerName)}>
                            تواصل
                        </button>
                    </div>
                </Popup>
            </Marker>
        )
    }

    if (item.type === 'STORY' && 'mediaType' in item.data) {
        const story = item.data as Story
        const isLive = story.user?.type === 'INDIVIDUAL'

        // Creating a custom icon for the story (Avatar with border)
        const iconHtml = `
            <div class="relative w-12 h-12">
                <div class="absolute inset-0 rounded-full border-2 ${isLive ? 'border-pink-500 animate-pulse' : 'border-blue-500'} overflow-hidden bg-black">
                    <img src="${story.user?.avatarUrl || '/placeholder-user.jpg'}" class="w-full h-full object-cover" />
                </div>
                ${isLive ? '<div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>' : ''}
            </div>
        `

        const customIcon = L.divIcon({
            className: 'custom-story-marker',
            html: iconHtml,
            iconSize: [48, 48],
            iconAnchor: [24, 24],
            popupAnchor: [0, -24]
        })

        return (
            <Marker
                key={story.id}
                position={position}
                icon={customIcon}
                eventHandlers={{
                    click: () => onViewStory?.(story)
                }}
            >
                <Popup>
                    <div className="text-center cursor-pointer" onClick={() => onViewStory?.(story)}>
                        <h3 className="font-bold text-sm">قصة {story.user?.name}</h3>
                        <p className="text-xs text-blue-500">اضغط للمشاهدة</p>
                    </div>
                </Popup>
            </Marker>
        )
    }

    return null
}
