'use client'

import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import { useRouter } from 'next/navigation'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useGeolocation, getDistance } from '@/hooks/useGeolocation'
import { useGeofencing } from '@/hooks/useGeofencing'
import { toast } from 'sonner'
import { startConversation } from '@/actions/chat'
// ChatWindow removed
import { getListings } from '@/actions/market'
import { getStories } from '@/actions/stories'
import { StoryViewer } from './StoryViewer'
import { MapFilterBar, FilterType, ALL_FILTERS } from './MapFilterBar'
import { SmartMarkerGroup } from './SmartMarkerGroup'
import { InteractionBar } from './profile/InteractionBar'
import { CommentsSheet } from './CommentsSheet'
// Duplicate import removed
// ZoneGridLayer removed

import { getShopIcon, getCompanyIcon, getIndividualIcon, getRequestIcon, getStoryIcon } from '@/utils/mapIcons'

// Type definition for Listings
interface Listing {
    id: string
    title: string
    latitude: number
    longitude: number
    price: number
    type: string // PRODUCT or REQUEST
    sellerId: string
    seller: {
        name: string | null
        phone: string
        reputationScore: number | null
        isVerified: boolean
        type: string | null
        shopCategory: string | null
    }
}

interface Story {
    id: string
    mediaUrl: string
    mediaType: string // 'VIDEO' | 'IMAGE'
    caption: string | null
    latitude: number
    longitude: number
    userId: string // 🆕 Ensure we capture this
    user: {
        name: string | null
        avatarUrl: string | null
        reputationScore?: number
        isVerified?: boolean
    }
    createdAt: Date
}

function MapController({
    userLat,
    userLng,
    listings
}: {
    userLat: number
    userLng: number
    listings: Listing[]
}) {
    const map = useMap()
    const isCentered = useRef(false)

    // 1. Autopilot: Ce-enter ONLY once when location is found
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
                    id: `listing-${listing.id}`, // Unique ID to prevent spam
                    duration: 5000
                })
            }
        })
    }, [userLat, userLng, listings])

    return null
}

function RecenterButton({ lat, lng }: { lat: number; lng: number }) {
    const map = useMap()
    return (
        <button
            onClick={() => map.flyTo([lat, lng], 16)}
            className="absolute bottom-24 left-4 z-[400] bg-white dark:bg-zinc-800 text-indigo-600 p-3 rounded-full shadow-xl border border-zinc-200 dark:border-zinc-700 hover:scale-110 transition-transform"
            title="موقعي الحالي"
        >
            🎯
        </button>
    )
}

import { MapControllerReverse } from './MapControllerReverse'

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
    const [selectedStory, setSelectedStory] = useState<Story | null>(null)
    const [isMounted, setIsMounted] = useState(false)
    const [selectedFilters, setSelectedFilters] = useState<FilterType[]>([])
    const [selectedListingForComments, setSelectedListingForComments] = useState<string | null>(null)

    // Chat State
    // Chat State Removed (Unused)

    // Fetch Listings on Mount, Refresh, and Location Change (Live Sync)
    useEffect(() => {
        setIsMounted(true)
    }, [])

    // 🚨 Activate Geofencing Alert System (300m Radius)
    useGeofencing({
        userLocation: coordinates,
        listings: listings as any,
        radius: 300
    })

    // Fetch Listings on Mount, Refresh, and Location Change (Live Sync)
    useEffect(() => {
        getListings().then(data => {
            setListings(data)
        })
        getStories().then(data => {
            setStories(data)
        })
    }, [refreshTrigger, coordinates]) // Re-fetch when trigger changes OR location changes

    // --- Filtering Logic ---
    const toggleFilter = (filter: FilterType) => {
        setSelectedFilters(prev => {
            const next = prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]

            // Auto-Reset: If all filters are selected, reset to "Show All" (Empty array)
            // This ensures visuals reset immediately when the user matches "All"
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

    // --- Clustering Logic (Group items by same location) ---
    // We combine all items into a generic structure to group them
    type MapItem = {
        type: 'LISTING' | 'STORY'
        data: Listing | Story
        lat: number
        lng: number
        id: string
    }

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
        }))
    ]

    const clusters: Record<string, MapItem[]> = {}
    allItems.forEach(item => {
        // Round to 5 decimal places (~1.1 meter precision) to group virtually identical
        const key = `${item.lat.toFixed(5)},${item.lng.toFixed(5)}`
        if (!clusters[key]) clusters[key] = []
        clusters[key].push(item)
    })

    async function handleStartChat(listingId: string, sellerId: string, sellerName: string | null) {
        if (!currentUserId) {
            toast.error('يجب عليك تسجيل الدخول لبدء المحادثة')
            return
        }
        if (sellerId === currentUserId) return

        const result = await startConversation(listingId, sellerId)
        if (result.error) {
            toast.error(result.error)
        } else {
            // setActiveChat({ id: result.conversationId!, recipientName: sellerName || 'Unknown' })
            // Logic to open chat window would go here if ChatWindow was used.
            // For now, redirect or toast.
            router.push(`/messages/${result.conversationId}`)
        }
    }

    const defaultCenter: [number, number] = [33.5731, -7.5898]
    const center = coordinates
        ? ([coordinates.latitude, coordinates.longitude] as [number, number])
        : defaultCenter

    if (!isMounted) return <div className="h-[600px] bg-zinc-900 animate-pulse" />

    // Render helper for SmartMarkerGroup
    const renderMarker = (item: MapItem, pos: [number, number], index: number) => {
        // Trust Helper
        const isTrusted = (score?: number | null, verified?: boolean) =>
            (score && score >= 80) || verified

        if (item.type === 'LISTING') {
            const listing = item.data as Listing
            const trusted = isTrusted(listing.seller.reputationScore, listing.seller.isVerified)

            // 🧠 Smart Icon Logic:
            // 1. Check if user currently has ANY active stories
            const hasStories = stories.some(s => s.userId === listing.sellerId)

            // 2. Determine Icon based on User Type
            let icon
            if (listing.type === 'REQUEST') {
                icon = getRequestIcon()
            } else {
                // Product - Check Seller Type
                const type = listing.seller.type || 'INDIVIDUAL' // Default
                if (type === 'SHOP') {
                    icon = getShopIcon(hasStories)
                } else if (type === 'COMPANY') {
                    icon = getCompanyIcon(hasStories)
                } else {
                    icon = getIndividualIcon(hasStories)
                }
            }

            return (
                <Marker key={listing.id} position={pos} icon={icon}>
                    <Popup className="compact-popup">
                        <div className="text-right min-w-[150px]">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="font-bold text-sm">
                                    {listing.type === 'REQUEST' ? '📣 طلب' : '🛒'} {listing.title}
                                </h3>
                                {trusted && (
                                    <div className="text-sm" title="بائع موثوق">
                                        🛡️
                                    </div>
                                )}
                            </div>

                            {listing.type === 'PRODUCT' && (
                                <p className="text-green-600 font-bold mb-1 text-xs">
                                    {listing.price} درهم
                                </p>
                            )}

                            <p className="text-[10px] text-zinc-500 mb-2 block">
                                {listing.type === 'REQUEST' ? 'الطالب:' : 'البائع:'}{' '}
                                {listing.seller.name}
                                {trusted && (
                                    <span className="text-yellow-600 font-bold mx-1 text-[9px]">
                                        ✓ موثوق
                                    </span>
                                )}
                            </p>

                            <div className="grid grid-cols-1 gap-1">
                                {listing.type === 'REQUEST' ? (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleStartChat(
                                                listing.id,
                                                listing.sellerId,
                                                listing.seller.name
                                            )
                                        }}
                                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-1.5 rounded-md text-xs transition-colors flex items-center justify-center gap-1 shadow-sm"
                                    >
                                        <span>💸</span>
                                        <span>قدم عرضاً</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleStartChat(
                                                listing.id,
                                                listing.sellerId,
                                                listing.seller.name
                                            )
                                        }}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 rounded-md text-xs transition-colors flex items-center justify-center gap-1 shadow-sm"
                                    >
                                        <span>💬</span>
                                        <span>مراسلة</span>
                                    </button>
                                )}

                                <a
                                    href={`tel:${listing.seller.phone}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="block w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-300 text-center py-1.5 rounded-md text-xs transition-colors font-medium"
                                >
                                    📞 اتصال
                                </a>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/u/${listing.sellerId}`)
                                    }}
                                    className="w-full bg-zinc-900 text-white border border-zinc-700 hover:bg-black py-1.5 rounded-md font-bold text-xs flex items-center justify-center gap-1 transition-colors mt-0.5"
                                >
                                    👤 الملف
                                </button>

                                <InteractionBar
                                    currentUserId={currentUserId || undefined}
                                    listingId={listing.id}
                                    initialLikes={0}
                                    initialLoves={0}
                                    commentsCount={0}
                                    onInteract={(type) => {
                                        if (type === 'COMMENT') {
                                            setSelectedListingForComments(listing.id)
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </Popup>
                </Marker>
            )
        } else {
            const story = item.data as Story
            const trusted = isTrusted(story.user.reputationScore, story.user.isVerified)

            return (
                <Marker
                    key={story.id}
                    position={pos}
                    icon={getStoryIcon(story.mediaUrl, story.mediaType)}
                >
                    <Popup className="story-popup" minWidth={250}>
                        <div className="text-center p-2">
                            {/* Trust Badge Header for Stories */}
                            {trusted && (
                                <div className="flex justify-center items-center gap-1 mb-2 bg-yellow-50/80 p-1 rounded-full border border-yellow-200 w-fit mx-auto">
                                    <span className="text-sm">🛡️</span>
                                    <span className="text-[10px] font-bold text-yellow-700">
                                        عضو مميز
                                    </span>
                                </div>
                            )}

                            <div
                                className="relative group cursor-pointer"
                                onClick={() => setSelectedStory(story)}
                            >
                                {/* Preview Thumbnail logic used in Map.tsx before */}
                                {story.mediaType === 'VIDEO' ? (
                                    <div className="relative w-full h-32 rounded-lg overflow-hidden border border-zinc-200">
                                        <video
                                            src={story.mediaUrl}
                                            muted
                                            className="w-full h-full object-cover brightness-90"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center text-white">
                                            ▶
                                        </div>
                                    </div>
                                ) : (
                                    <img
                                        src={story.mediaUrl}
                                        className="w-full h-32 object-cover rounded-lg border border-zinc-200"
                                    />
                                )}
                            </div>
                            <button
                                onClick={() => setSelectedStory(story)}
                                className="w-full mt-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded-md font-bold text-sm hover:opacity-90 transition-opacity"
                            >
                                مشهادة القصة كاملة 📱
                            </button>

                            <button
                                onClick={() => router.push(`/u/${story.userId}`)}
                                className="w-full mt-2 bg-zinc-800 text-white hover:bg-zinc-700 py-1.5 rounded-md font-medium text-xs border border-zinc-600 transition-colors flex items-center justify-center gap-1"
                            >
                                👤 زيارة الملف
                            </button>
                        </div>
                    </Popup>
                </Marker>
            )
        }
    }
    return (
        <div className="h-[600px] w-full rounded-xl overflow-hidden border border-zinc-800 shadow-2xl relative z-0">
            <MapContainer center={center} zoom={16} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {coordinates && (
                    <>
                        <MapController
                            userLat={coordinates.latitude}
                            userLng={coordinates.longitude}
                            listings={filteredListings}
                        />
                        <MapControllerReverse
                            userLat={coordinates.latitude}
                            userLng={coordinates.longitude}
                            listings={filteredListings}
                            userType={userType}
                        />
                        <RecenterButton lat={coordinates.latitude} lng={coordinates.longitude} />
                    </>
                )}

                {/* User Marker */}
                <Marker position={center} icon={getIndividualIcon(false)}>
                    <Popup>
                        <div className="text-right">
                            <h3 className="font-bold">أنت هنا 📍</h3>
                        </div>
                    </Popup>
                </Marker>
                <Circle
                    center={center}
                    radius={300}
                    pathOptions={{ color: '#22c55e', fillColor: '#22c55e', fillOpacity: 0.2 }}
                />

                {/* Render Clusters */}
                {Object.entries(clusters).map(([key, group]) => (
                    <SmartMarkerGroup
                        key={key}
                        center={[group[0].lat, group[0].lng]}
                        items={group}
                        renderMarker={renderMarker}
                        forceExpanded={selectedFilters.length > 0}
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
