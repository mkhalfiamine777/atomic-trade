import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { getDistance } from './useGeolocation'

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
                const icon = listing.type === 'REQUEST' ? '📣' : '🏪'
                const typeName = listing.type === 'REQUEST' ? 'طلب' : 'متجر'

                toast(`${icon} أنت قريب من ${typeName}!`, {
                    description: `📍 ${listing.title} على بعد ${Math.round(distance)} متر فقط.`,
                    duration: 5000,
                    action: {
                        label: 'عرض',
                        onClick: () => {
                            // This interaction is handled by the map generally, 
                            // but we could add logic to center map if we had access to map instance here.
                            // For now, it's just a notification.
                        }
                    }
                })
            }
        })
    }, [userLocation, listings, radius])
}
