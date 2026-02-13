import React from 'react'
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
}

export function MapMarker({ item, position, onStartChat }: MapMarkerProps) {
    if (item.type === 'LISTING') {
        const listing = item.data as Listing
        const sellerName = listing.seller?.name || 'Unknown'

        return (
            <Marker key={listing.id} position={position} icon={listing.type === 'PRODUCT' ? getShopIcon(false, true) : getRequestIcon()}>
                <Popup className="compact-popup">
                    <div className="text-right min-w-[150px]">
                        <h3 className="font-bold text-sm">{listing.title}</h3>
                        <p className="text-xs">{sellerName}</p>
                        <button className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-xs w-full"
                            onClick={() => onStartChat(listing.id, listing.sellerId, sellerName)}>
                            تواصل
                        </button>
                    </div>
                </Popup>
            </Marker>
        )
    }
    // Fallback for others (Story/Post markers logic could be added here if needed, currently Map implementation mainly focuses on listings or handles them differently)
    return null
}
