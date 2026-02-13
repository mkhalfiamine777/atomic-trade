import { useState, useEffect, useRef } from 'react'
import { updateUserLocation } from '@/actions/user' // Import server action

import { Coordinates } from "@/types";

interface GeolocationState {
    coordinates: Coordinates | null
    error: string | null
    loading: boolean
}

// Haversine Formula to calculate distance in meters
export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3 // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lon2 - lon1) * Math.PI) / 180

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c // Distance in meters
}

export function useGeolocation() {
    const [state, setState] = useState<GeolocationState>(() => {
        if (typeof window !== 'undefined' && !('geolocation' in navigator)) {
            return { coordinates: null, error: 'Geolocation not supported', loading: false }
        }
        return { coordinates: null, error: null, loading: true }
    })

    useEffect(() => {
        if (!navigator.geolocation) {
            setState({ coordinates: null, error: 'Geolocation is not supported', loading: false })
            return
        }

        const geo = navigator.geolocation
        const watcher = geo.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords
                const newCoords: Coordinates = { lat: latitude, lng: longitude }

                setState({ coordinates: newCoords, error: null, loading: false })

                // Only sync to server if not syncing or far enough (optimization)
                updateUserLocation(newCoords.lat, newCoords.lng)
            },
            (error) => {
                setState(prev => ({ ...prev, error: error.message, loading: false }))
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 5000 // More partial real-time
            }
        )

        return () => navigator.geolocation.clearWatch(watcher)
    }, [])

    return { ...state, loading: !state.coordinates && !state.error }
}
