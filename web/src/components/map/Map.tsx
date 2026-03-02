'use client'

import { useEffect, useState } from 'react'
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

import { getIndividualIcon } from '@/utils/mapIcons'

import { LocationUser, Listing, Story, Post } from "@/types"
import { MapControls, RecenterButton } from './MapControls'
import { MapMarker, MapItem } from './MapMarker'
import { getAllActiveUsers } from '@/actions/map'
import { ZoneGridLayer } from './ZoneGridLayer'

import { useAppStore } from '@/store/useAppStore'

export default function Map({
    refreshTrigger = 0,
    isLocationVisible = true,
}: {
    refreshTrigger?: number
    isLocationVisible?: boolean
}) {
    const { currentUser, showZoneGrid } = useAppStore()
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

    // Group items by coordinate to space them out perfectly horizontally if they overlap
    const rawItems: MapItem[] = [
        ...filteredListings.map(l => ({ type: 'LISTING' as const, data: l, lat: l.latitude, lng: l.longitude, id: l.id })),
        ...filteredStories.map(s => ({ type: 'STORY' as const, data: s, lat: s.latitude, lng: s.longitude, id: s.id })),
        ...posts.map(p => ({ type: 'POST' as const, data: p, lat: p.latitude, lng: p.longitude, id: p.id }))
    ]

    const positionMap: Record<string, MapItem[]> = {};
    rawItems.forEach(item => {
        const key = `${item.lat},${item.lng}`;
        if (!positionMap[key]) positionMap[key] = [];
        positionMap[key].push(item);
    });

    const allItems: MapItem[] = [];
    Object.values(positionMap).forEach((itemsAtPosition) => {
        // First group by exact type so similar icons merge
        const groups: Record<string, MapItem[]> = {};

        itemsAtPosition.forEach(item => {
            let subType = item.type as string;
            if (item.type === 'LISTING') {
                subType = `LISTING:${(item.data as any).type}`; // PRODUCT or REQUEST
            } else if (item.type === 'STORY') {
                subType = `STORY:${(item.data as any).mediaType}`; // VIDEO or IMAGE
            }
            if (!groups[subType]) groups[subType] = [];
            groups[subType].push(item);
        });

        const consolidatedItems = Object.values(groups).map(group => {
            const first = group[0];
            return {
                ...first,
                count: group.length,
                groupedData: group.map(g => g.data)
            };
        });

        const total = consolidatedItems.length;
        if (total === 1) {
            allItems.push(consolidatedItems[0]);
        } else {
            // Distribute distinct horizontal categories cleanly beneath the main point
            consolidatedItems.forEach((item, index) => {
                const centerOffset = (total - 1) / 2;
                // Offset vertically by 38 pixels to ensure it clears the main icon (size 32 + shadow)
                // Offset horizontally by 36 pixels per item to form a perfect line
                const offsetX = (index - centerOffset) * 36;
                const offsetY = 38;

                allItems.push({
                    ...item,
                    lat: item.lat, // Original lat
                    lng: item.lng, // Original lng
                    offsetX,
                    offsetY
                });
            });
        }
    });

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

                <Marker position={center} icon={getIndividualIcon(false, true, isLocationVisible)}>
                    <Popup>
                        <div className="text-right">
                            <h3 className="font-bold">
                                {isLocationVisible ? 'أنت هنا 📍' : 'أنت مخفي 👻'}
                            </h3>
                            {!isLocationVisible && (
                                <p className="text-xs text-red-500">لا يراك الآخرون</p>
                            )}
                        </div>
                    </Popup>
                </Marker>

                {/* Global Users Markers */}
                {globalUsers.map((user) => (
                    <MapMarker
                        key={`global-${user.id}`}
                        item={{
                            type: 'POST', // Using POST type temporarily to reuse MapMarker style or creating a custom logic
                            id: user.id,
                            lat: user.latitude,
                            lng: user.longitude,
                            data: {
                                id: user.id,
                                caption: user.name || user.username || 'مستخدم',
                                mediaType: 'IMAGE',
                                mediaUrl: user.avatarUrl || '/placeholder-user.jpg',
                                latitude: user.latitude,
                                longitude: user.longitude,
                                userId: user.id,
                                createdAt: new Date(),
                                user: {
                                    id: user.id,
                                    name: user.name,
                                    username: user.username,
                                    avatarUrl: user.avatarUrl,
                                    type: user.type,
                                    isVerified: false,
                                    reputationScore: 0
                                }
                            }
                        }}
                        position={[user.latitude, user.longitude]}
                        onStartChat={(id) => handleStartChat(id, user.id, user.name)} // listingId is user.id here? No, this needs adjustment
                        onViewStory={() => { }} // No story view for global users yet
                    />
                ))}

                {allItems.map((item) => (
                    <MapMarker
                        key={item.id}
                        item={item}
                        position={[item.lat, item.lng]}
                        onStartChat={handleStartChat}
                        onViewStory={(story) => setSelectedStory(story)}
                    />
                ))}

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
