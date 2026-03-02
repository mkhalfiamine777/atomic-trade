import { useEffect, useRef } from 'react'
import { getDistance } from './useGeolocation'
import { useNotificationStore } from '@/store/useNotificationStore'
import { Coordinates, Listing } from "@/types";

interface UseGeofencingProps {
    userLocation: Coordinates | null
    listings: Listing[]
    radius?: number // in meters, default 300
}

export function useGeofencing({ userLocation, listings, radius = 300 }: UseGeofencingProps) {
    // Keep track of listings we've already notified about in this session
    const notifiedListings = useRef<Set<string>>(new Set())

    useEffect(() => {
        if (!userLocation) return

        listings.forEach(listing => {
            // calculated distance
            const distance = getDistance(
                userLocation.lat,
                userLocation.lng,
                listing.latitude,
                listing.longitude
            )

            // Logic:
            // 1. Within range
            // 2. Not already notified
            // 3. Not the user's own listing (optional, but good UX)
            // 4. Listing type check? (Usually for shops/companies with physical presence)

            if (distance <= radius && !notifiedListings.current.has(listing.id)) {

                // Add to notified set immediately to prevent double firing
                notifiedListings.current.add(listing.id)

                // Trigger Alert
                useNotificationStore.getState().addNotification({
                    type: listing.type === 'REQUEST' ? 'PROXIMITY_REQUEST' : 'PROXIMITY_PRODUCT',
                    title: listing.type === 'REQUEST' ? '📣 طلب قريب!' : '🏪 متجر قريب!',
                    message: `📍 "${listing.title}" على بعد ${Math.round(distance)} متر فقط.`,
                    data: { listingId: listing.id }
                });
            }
        })
    }, [userLocation, listings, radius])
}
