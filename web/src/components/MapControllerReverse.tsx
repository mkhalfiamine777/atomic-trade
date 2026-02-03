'use client'

import { useEffect } from 'react'
import { getDistance } from '@/hooks/useGeolocation'
import { toast } from 'sonner'

interface Listing {
    id: string
    title: string
    latitude: number
    longitude: number
    type: string
}

interface Props {
    userLat: number
    userLng: number
    listings: Listing[]
    userType: string
}

export function MapControllerReverse({ userLat, userLng, listings, userType }: Props) {
    // Configuration (Future: Get from User Settings)
    const NOTIFICATION_RADIUS_METERS = 5000 // 5km Radius 📡

    useEffect(() => {
        if (!userLat || !userLng) return

        // Filter for Requests ONLY
        const nearbyRequests = listings.filter(
            l =>
                l.type === 'REQUEST' &&
                getDistance(userLat, userLng, l.latitude, l.longitude) <= NOTIFICATION_RADIUS_METERS
        )

        if (nearbyRequests.length > 0) {
            // Rate limit: Show max 1 toast every few seconds to avoid spam
            const latestRequest = nearbyRequests[0] // Just show the first one for now

            // Avoid duplicate toasts if possible (simple dedup by ID in toast options)
            toast('📣 فرصة بيع قريبة!', {
                id: `req-${latestRequest.id}`,
                description: `شخص يبحث عن "${latestRequest.title}" على بعد ${Math.round(getDistance(userLat, userLng, latestRequest.latitude, latestRequest.longitude))} متر.`,
                action: {
                    label: 'عرض',
                    onClick: () => {
                        // In future: Center map on request
                    }
                },
                duration: 8000, // Stay longer
                position: 'top-center', // Prominent position
                style: {
                    background: 'linear-gradient(to right, #4c1d95, #7e22ce)',
                    color: 'white',
                    border: '1px solid #a855f7'
                }
            })
        }
    }, [userLat, userLng, listings, userType])

    return null // Controller component, no UI
}
