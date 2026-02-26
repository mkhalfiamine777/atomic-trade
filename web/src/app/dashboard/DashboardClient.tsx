'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { CreatePostModal } from '@/components/modals/CreatePostModal'
import { AddProductModal } from '@/components/modals/AddProductModal'
import { CreateRequestModal } from '@/components/modals/CreateRequestModal'
import { CreateStoryModal } from '@/components/modals/CreateStoryModal'
import { useGeolocation } from '@/hooks/useGeolocation'
import { updateUserLocation } from '@/actions/user'
import { BottomNav } from '@/components/layout/BottomNav'
import { LogOut } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { SettingsDrawer } from '@/components/dashboard/SettingsDrawer'
import { NotificationBell } from '@/components/notifications/NotificationBell'

import { useAppStore } from '@/store/useAppStore'

// Dynamically import Map to avoid SSR issues
const Map = dynamic(() => import('@/components/map/Map'), {
    ssr: false,
    loading: () => <div className="h-screen w-full bg-zinc-950 flex items-center justify-center"><div className="animate-spin text-blue-500">🌍</div></div>
})

export default function DashboardClient({
    userId,
    userType,
    userName
}: {
    userId: string
    userType: string
    userName?: string | null
}) {
    const [isAddProductOpen, setIsAddProductOpen] = useState(false)
    const [isRequestOpen, setIsRequestOpen] = useState(false)
    const [isPostOpen, setIsPostOpen] = useState(false) // New Post Modal State
    const [isStoryOpen, setIsStoryOpen] = useState(false)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false) // ⚙️ Drawer Control

    // Local UI states
    const [isLocationVisible, setIsLocationVisible] = useState(true) // 👻 Location Visibility State
    const toggleLocationVisibility = () => setIsLocationVisible(prev => !prev)

    const { setCurrentUser, showZoneGrid, toggleZoneGrid } = useAppStore()

    // Initialize the user in the global store on mount
    useEffect(() => {
        if (userId) {
            setCurrentUser({
                id: userId,
                name: userName || 'مستخدم',
                type: userType,
                username: null,
                avatarUrl: null,
                reputationScore: 0,
                isVerified: false
            })
        }
    }, [userId, userName, userType, setCurrentUser])

    const [refreshTrigger, setRefreshTrigger] = useState(0)
    const router = useRouter()
    const lastLocationUpdate = useRef<number>(0)

    const handleRefresh = () => setRefreshTrigger(prev => prev + 1)

    const { coordinates } = useGeolocation()

    // Live Tracking: Throttled - update user location every 30s max
    useEffect(() => {
        if (coordinates && isLocationVisible) { // Only update if visible
            const now = Date.now()
            if (now - lastLocationUpdate.current > 30000) {
                lastLocationUpdate.current = now
                updateUserLocation(coordinates.lat, coordinates.lng)
            }
        }
    }, [coordinates, isLocationVisible])

    // Unified Modal Handler (Used by both Drawer and FAB)
    const handleOpenModal = (action: 'PRODUCT' | 'REQUEST' | 'POST' | 'STORY') => {
        switch (action) {
            case 'PRODUCT': setIsAddProductOpen(true); break;
            case 'REQUEST': setIsRequestOpen(true); break;
            case 'POST': setIsPostOpen(true); break;
            case 'STORY': setIsStoryOpen(true); break;
        }
    }

    return (
        <div className="relative h-screen w-full overflow-hidden bg-zinc-950">
            {/* Modals */}
            <AddProductModal
                isOpen={isAddProductOpen}
                onClose={() => setIsAddProductOpen(false)}
                onSuccess={handleRefresh}
            />
            <CreateRequestModal isOpen={isRequestOpen} onClose={() => setIsRequestOpen(false)} />

            <CreatePostModal
                isOpen={isPostOpen}
                onClose={() => setIsPostOpen(false)}
                userId={userId}
                onSuccess={handleRefresh}
            />

            {coordinates && (
                <CreateStoryModal
                    isOpen={isStoryOpen}
                    onClose={() => setIsStoryOpen(false)}
                    userId={userId}
                    userLat={coordinates.lat}
                    userLng={coordinates.lng}
                    onSuccess={handleRefresh}
                />
            )}

            {/* ⚙️ Unified Settings Drawer */}
            <SettingsDrawer
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                userName={userName}
                userType={userType}
                onOpenAction={handleOpenModal}
                isLocationVisible={isLocationVisible}
                onToggleLocation={toggleLocationVisibility}
                showZoneGrid={showZoneGrid}
                onToggleZoneGrid={toggleZoneGrid}
            />

            {/* 🌍 Full Screen Map */}
            <div className="absolute inset-0 z-0">
                <Map
                    refreshTrigger={refreshTrigger}
                    isLocationVisible={isLocationVisible}
                />
            </div>



            {/* 📱 Bottom Navigation */}
            <BottomNav />

            {/* 🔔 Notifications & 🍔 Menu */}
            <div className="absolute top-24 right-4 z-50 flex flex-col gap-3">
                <NotificationBell />
                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="w-10 h-10 bg-black/40 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors shadow-lg"
                    title="القائمة"
                >
                    <MenuIcon size={20} />
                </button>
            </div>
        </div>
    )
}

function MenuIcon({ size }: { size: number }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
        </svg>
    )
}
