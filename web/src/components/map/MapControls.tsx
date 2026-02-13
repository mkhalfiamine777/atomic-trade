import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import { toast } from 'sonner'
import { getDistance } from '@/hooks/useGeolocation'
import { Listing } from '@/types'

interface MapControlsProps {
    userLat: number
    userLng: number
    listings: Listing[]
}

export function MapControls({ userLat, userLng, listings }: MapControlsProps) {
    const map = useMap()
    const isCentered = useRef(false)

    // 1. Autopilot: Re-enter ONLY once when location is found
    useEffect(() => {
        if (!userLat || !userLng || isCentered.current) return

        const timer = setTimeout(() => {
            map.flyTo([userLat, userLng], 16, { animate: true })
            isCentered.current = true
        }, 1000) // Delay slightly to ensure map is ready

        return () => clearTimeout(timer)
    }, [userLat, userLng, map])

    // 2. Radar: Check for nearby listings
    useEffect(() => {
        if (!userLat || !userLng) return
        listings.forEach(listing => {
            const distance = getDistance(userLat, userLng, listing.latitude, listing.longitude)
            // Show alert if distance <= 300m
            if (distance <= 300) {
                toast.success(`🎉 أنت قريب من "${listing.title}"! (${Math.round(distance)}م)`, {
                    id: `listing-${listing.id}`,
                    duration: 5000
                })
            }
        })
    }, [userLat, userLng, listings])

    return null
}

export function RecenterButton({ lat, lng }: { lat: number; lng: number }) {
    const map = useMap()
    return (
        <button
            onClick={() => map.flyTo([lat, lng], 16)}
            className="absolute bottom-32 left-4 z-[400] bg-white dark:bg-zinc-800 text-indigo-600 p-3 rounded-full shadow-xl border border-zinc-200 dark:border-zinc-700 hover:scale-110 transition-transform"
            title="موقعي الحالي"
        >
            🎯
        </button>
    )
}
