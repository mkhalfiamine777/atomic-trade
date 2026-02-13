'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useRouter } from 'next/navigation'
import 'leaflet/dist/leaflet.css'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useGeofencing } from '@/hooks/useGeofencing'
import { toast } from 'sonner'
import { startConversation } from '@/actions/chat'
// ChatWindow removed
import { getListings } from '@/actions/market'
import { getStories } from '@/actions/stories'
import { getMapPosts } from '@/actions/social'
import { StoryViewer } from './StoryViewer'
import { MapFilterBar, FilterType, ALL_FILTERS } from './MapFilterBar'
import { CommentsSheet } from './CommentsSheet'

import { getIndividualIcon } from '@/utils/mapIcons'

import { Listing, Story, Post } from "@/types"
import { MapControls, RecenterButton } from './map/MapControls'
import { MapMarker, MapItem } from './map/MapMarker'

export default function Map({
    currentUserId,
    userType = 'INDIVIDUAL',
    refreshTrigger = 0
}: {
    currentUserId?: string | null
    userType?: string
    refreshTrigger?: number
}) {
    const router = useRouter()
    const { coordinates, loading, error } = useGeolocation()
    const [listings, setListings] = useState<Listing[]>([])
    const [stories, setStories] = useState<Story[]>([])
    const [posts, setPosts] = useState<Post[]>([])
    const [selectedStory, setSelectedStory] = useState<Story | null>(null)
    const [isMounted, setIsMounted] = useState(false)
    const [selectedFilters, setSelectedFilters] = useState<FilterType[]>([])
    const [selectedListingForComments, setSelectedListingForComments] = useState<string | null>(null)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    useGeofencing({
        userLocation: coordinates,
        listings: listings,
        radius: 300
    })

    useEffect(() => {
        getListings().then(data => setListings(data as unknown as Listing[]))
        getStories().then(data => setStories(data as unknown as Story[]))
        getMapPosts().then(data => setPosts(data as unknown as Post[]))
    }, [refreshTrigger, coordinates])

    const toggleFilter = (filter: FilterType) => {
        setSelectedFilters(prev => {
            const next = prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
            return next.length === ALL_FILTERS.length ? [] : next
        })
    }

    const filteredListings = listings.filter(l => {
        if (selectedFilters.length === 0) return true
        if (l.type === 'PRODUCT' && selectedFilters.includes('PRODUCT')) return true
        if (l.type === 'REQUEST' && selectedFilters.includes('REQUEST')) return true
        return false
    })

    const filteredStories = stories.filter(s => {
        if (selectedFilters.length === 0) return true
        if (s.mediaType === 'VIDEO' && selectedFilters.includes('VIDEO')) return true
        if (s.mediaType === 'IMAGE' && selectedFilters.includes('IMAGE')) return true
        return false
    })

    const allItems: MapItem[] = [
        ...filteredListings.map(l => ({
            type: 'LISTING' as const,
            data: l,
            lat: l.latitude,
            lng: l.longitude,
            id: l.id
        })),
        ...filteredStories.map(s => ({
            type: 'STORY' as const,
            data: s,
            lat: s.latitude,
            lng: s.longitude,
            id: s.id
        })),
        ...posts.map(p => ({
            type: 'POST' as const,
            data: p,
            lat: p.latitude,
            lng: p.longitude,
            id: p.id
        }))
    ]

    async function handleStartChat(listingId: string, sellerId: string, sellerName?: string | null) {
        if (!currentUserId) {
            toast.error('يجب عليك تسجيل الدخول لبدء المحادثة')
            return
        }
        if (sellerId === currentUserId) return

        const result = await startConversation(listingId, sellerId)
        if (result.error) {
            toast.error(result.error)
        } else {
            router.push(`/messages/${result.conversationId}`)
        }
    }

    const defaultCenter: [number, number] = [33.5731, -7.5898]
    const center = coordinates
        ? ([coordinates.lat, coordinates.lng] as [number, number])
        : defaultCenter

    if (!isMounted) return <div className="h-[600px] bg-zinc-900 animate-pulse" />

    return (
        <div className="h-full w-full relative z-0 bg-zinc-950">
            <MapContainer center={center} zoom={16} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {coordinates && (
                    <>
                        <MapControls
                            userLat={coordinates.lat}
                            userLng={coordinates.lng}
                            listings={filteredListings}
                        />
                        <RecenterButton lat={coordinates.lat} lng={coordinates.lng} />
                    </>
                )}

                <Marker position={center} icon={getIndividualIcon(false)}>
                    <Popup>
                        <div className="text-right">
                            <h3 className="font-bold">أنت هنا 📍</h3>
                        </div>
                    </Popup>
                </Marker>

                {allItems.map((item) => (
                    <MapMarker
                        key={item.id}
                        item={item}
                        position={[item.lat, item.lng]}
                        onStartChat={handleStartChat}
                    />
                ))}

            </MapContainer>

            <MapFilterBar selectedFilters={selectedFilters} onToggle={toggleFilter} />

            <StoryViewer
                isOpen={!!selectedStory}
                onClose={() => setSelectedStory(null)}
                story={selectedStory}
            />

            <CommentsSheet
                listingId={selectedListingForComments}
                onClose={() => setSelectedListingForComments(null)}
                currentUserId={currentUserId || undefined}
            />

            <div className="absolute top-4 right-4 z-[1000] bg-white/90 dark:bg-zinc-900/90 backdrop-blur px-4 py-2 rounded-lg border shadow-lg text-xs">
                {loading
                    ? '📡 جاري البحث عن الأقمار الصناعية...'
                    : error
                        ? `❌ ${error}`
                        : '✅ الموقع دقيق'}
            </div>
        </div>
    )
}
