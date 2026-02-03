import { useState, useEffect, useRef } from 'react'
import { updateUserLocation } from '@/actions/user' // Import server action

interface Coordinates {
    latitude: number
    longitude: number
}

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
    const [location, setLocation] = useState<GeolocationState>(() => {
        if (typeof window !== 'undefined' && !('geolocation' in navigator)) {
            return { coordinates: null, error: 'Geolocation not supported', loading: false }
        }
        return { coordinates: null, error: null, loading: true }
    })

    const lastSyncedLocation = useRef<Coordinates | null>(null)
    const isSyncing = useRef(false)

    useEffect(() => {
        if (!('geolocation' in navigator)) return

        const watcher = navigator.geolocation.watchPosition(
            async position => {
                const newCoords = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                }

                setLocation({
                    coordinates: newCoords,
                    error: null,
                    loading: false
                })

                // 🔄 Server Sync Logic (The Nomad Vendor)
                // Only sync if moved > 10 meters to save battery/data
                if (!isSyncing.current) {
                    const dist = lastSyncedLocation.current
                        ? getDistance(
                              lastSyncedLocation.current.latitude,
                              lastSyncedLocation.current.longitude,
                              newCoords.latitude,
                              newCoords.longitude
                          )
                        : 999 // Force first sync

                    if (dist > 10) {
                        isSyncing.current = true
                        try {
                            // Fire and forget (don't await strictly to block UI)
                            updateUserLocation(newCoords.latitude, newCoords.longitude).then(() => {
                                lastSyncedLocation.current = newCoords
                                isSyncing.current = false
                            })
                        } catch (e) {
                            isSyncing.current = false
                        }
                    }
                }
            },
            error => {
                setLocation(prev => ({ ...prev, error: error.message, loading: false }))
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 5000 // More partial real-time
            }
        )

        return () => navigator.geolocation.clearWatch(watcher)
    }, [])

    return location
}
