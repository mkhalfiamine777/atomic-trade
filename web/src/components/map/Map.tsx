'use client'

import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import { useRouter } from 'next/navigation'
import 'leaflet/dist/leaflet.css'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useGeofencing } from '@/hooks/useGeofencing'
import { toast } from 'sonner'
import { startConversation } from '@/actions/chat'
import { getListings } from '@/actions/market'
import { getStories } from '@/actions/stories'
import { getMapPosts } from '@/actions/social'
import { StoryViewer } from '../StoryViewer'
import { MapFilterBar, FilterType, ALL_FILTERS } from './MapFilterBar'
import { CommentsSheet } from '../CommentsSheet'

import { getIndividualIcon, getShopIcon, getCompanyIcon } from '@/utils/mapIcons'

import { LocationUser, Listing, Story, Post } from "@/types"
import { MapControls, RecenterButton } from './MapControls'
import { MapMarker, MapItem } from './MapMarker'
import { getAllActiveUsers } from '@/actions/map'
import { ZoneGridLayer } from './ZoneGridLayer'
import { SuperclusterLayer } from './SuperclusterLayer'

import { useAppStore } from '@/store/useAppStore'

export default function Map({
    refreshTrigger = 0,
    isLocationVisible = true,
}: {
    refreshTrigger?: number
    isLocationVisible?: boolean
}) {
    const { currentUser, showZoneGrid, mapType } = useAppStore()
    const currentUserId = currentUser?.id
    const userType = currentUser?.type || 'INDIVIDUAL'
    const router = useRouter()
    const { coordinates, loading, error } = useGeolocation()
    const [listings, setListings] = useState<Listing[]>([])
    const [stories, setStories] = useState<Story[]>([])
    const [posts, setPosts] = useState<Post[]>([])
    const [globalUsers, setGlobalUsers] = useState<LocationUser[]>([])
    const [selectedStory, setSelectedStory] = useState<Story | null>(null)
    const [isMounted, setIsMounted] = useState(false)
    const [selectedFilters, setSelectedFilters] = useState<FilterType[]>([])
    const [selectedListingForComments, setSelectedListingForComments] = useState<string | null>(null)

    // User Cluster Visibility State
    const [userClusterVisibility, setUserClusterVisibility] = useState<'auto' | 'pinned' | 'hidden'>('auto')
    const [isUserClusterHovered, setIsUserClusterHovered] = useState(false)
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        if (userClusterVisibility === 'auto') {
            const timer = setTimeout(() => {
                setUserClusterVisibility('hidden')
            }, 30000) // 30 seconds auto-hide
            return () => clearTimeout(timer)
        }
    }, [userClusterVisibility])

    const handleMouseEnterCluster = () => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
        setIsUserClusterHovered(true)
    }

    const handleMouseLeaveCluster = () => {
        hoverTimeoutRef.current = setTimeout(() => {
            setIsUserClusterHovered(false)
        }, 500) // 500ms grace period so moving mouse to cluster doesn't hide it
    }

    const showUserCluster = userClusterVisibility === 'pinned' || userClusterVisibility === 'auto' || isUserClusterHovered


    useEffect(() => {
        setIsMounted(true)
        // Fetch all active users for global visibility
        getAllActiveUsers().then(setGlobalUsers)
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
            // If nothing was selected (showing all), clicking one isolates it
            if (prev.length === 0) {
                return [filter]
            }

            // If it's already selected, remove it
            if (prev.includes(filter)) {
                const next = prev.filter(f => f !== filter)
                return next // If this empties it, it goes back to showing all naturally via logic below
            }

            // Otherwise, add it to the multi-select
            const next = [...prev, filter]
            // If they selected everything one by one, just clear it to show all state
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

    const filteredPosts = posts.filter(() => {
        if (selectedFilters.length === 0) return true
        return false // Posts don't fit into PRODUCT, REQUEST, VIDEO, or IMAGE yet
    })

    const filteredUsers = globalUsers.filter(u => {
        if (u.id === currentUserId) return false // Always hide current user from cluster map
        if (selectedFilters.length === 0) return true
        return false // Hide users when filtering for specific items
    })

    const allItems: MapItem[] = [
        ...filteredListings.map(l => ({ type: 'LISTING' as const, data: l, lat: l.latitude, lng: l.longitude, id: l.id })),
        ...filteredStories.map(s => ({ type: 'STORY' as const, data: s, lat: s.latitude, lng: s.longitude, id: s.id })),
        ...filteredPosts.map(p => ({ type: 'POST' as const, data: p, lat: p.latitude, lng: p.longitude, id: p.id })),
        ...filteredUsers.map(u => ({ type: 'USER' as const, data: u, lat: u.latitude, lng: u.longitude, id: `user-${u.id}` }))
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
                {mapType === 'street' ? (
                    <TileLayer
                        key="street"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                ) : (
                    <TileLayer
                        key="satellite"
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
                    />
                )}
                {coordinates && (
                    <>
                        <MapControls
                            userLat={coordinates.lat}
                            userLng={coordinates.lng}
                            listings={filteredListings}
                        />
                        <Circle
                            center={[coordinates.lat, coordinates.lng]}
                            radius={userType === 'SHOP' ? 5000 : 300}
                            pathOptions={{
                                color: userType === 'SHOP' ? '#ffd700' : '#39ff14',
                                fillColor: userType === 'SHOP' ? '#ffd700' : '#39ff14',
                                fillOpacity: userType === 'SHOP' ? 0.05 : 0.1, // Lighter opacity for the huge 5km circle
                                weight: 2,
                                dashArray: '5, 10'
                            }}
                        />
                        <RecenterButton lat={coordinates.lat} lng={coordinates.lng} />
                    </>
                )}

                <Marker
                    position={center}
                    icon={
                        userType === 'SHOP'
                            ? getShopIcon(false, true, isLocationVisible)
                            : userType === 'COMPANY'
                                ? getCompanyIcon(false, true, isLocationVisible)
                                : getIndividualIcon(false, true, isLocationVisible)
                    }
                    eventHandlers={{
                        mouseover: handleMouseEnterCluster,
                        mouseout: handleMouseLeaveCluster,
                        click: () => setUserClusterVisibility(prev => prev === 'pinned' ? 'hidden' : 'pinned')
                    }}
                >
                    <Popup>
                        <div className="text-right min-w-[180px] p-2" dir="rtl">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">{isLocationVisible ? '📍' : '👻'}</span>
                                <div>
                                    <h3 className="font-bold text-sm text-white leading-tight">
                                        {isLocationVisible ? 'أنت هنا' : 'أنت مخفي'}
                                    </h3>
                                    {!isLocationVisible && (
                                        <p className="text-[11px] text-red-400">لا يراك الآخرون</p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => setUserClusterVisibility(prev => prev === 'pinned' ? 'hidden' : 'pinned')}
                                className={`w-full text-[11px] font-medium py-1.5 px-3 rounded-lg border transition-all flex items-center justify-center gap-1.5 ${userClusterVisibility === 'pinned'
                                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                                    : 'bg-white/[0.06] text-zinc-300 border-white/10 hover:bg-white/10'
                                    }`}
                            >
                                {userClusterVisibility === 'pinned' ? '📌 الرموز مُثبتة — إلغاء' : '📌 تثبيت الرموز'}
                            </button>
                        </div>
                    </Popup>
                </Marker>

                {/* Smart Clustering Layer for ALL Items and Users */}
                {showUserCluster && (
                    <SuperclusterLayer
                        items={allItems}
                        onStartChat={handleStartChat}
                        onViewStory={(story) => setSelectedStory(story)}
                        onMouseEnter={handleMouseEnterCluster}
                        onMouseLeave={handleMouseLeaveCluster}
                    />
                )}

                {/* 🏰 Zone Grid Layer (Conditional) */}
                {showZoneGrid && <ZoneGridLayer currentUserId={currentUserId} />}

            </MapContainer>

            <MapFilterBar
                selectedFilters={selectedFilters}
                onToggle={toggleFilter}
            />

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
