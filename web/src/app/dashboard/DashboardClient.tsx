'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CreatePostModal } from '@/components/CreatePostModal'
import { AddProductModal } from '@/components/AddProductModal'
import { CreateRequestModal } from '@/components/CreateRequestModal'
import { CreateStoryModal } from '@/components/CreateStoryModal'
import { useGeolocation } from '@/hooks/useGeolocation'
import { updateUserLocation } from '@/actions/user'
import { BottomNav } from '@/components/layout/BottomNav'
import { Plus, ShoppingBag, Video, MessageSquarePlus } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

// Dynamically import Map to avoid SSR issues
const Map = dynamic(() => import('@/components/Map'), {
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
    const [isFabOpen, setIsFabOpen] = useState(false)
    const [refreshTrigger, setRefreshTrigger] = useState(0)
    const router = useRouter()

    const handleRefresh = () => setRefreshTrigger(prev => prev + 1)

    const { coordinates } = useGeolocation()

    // Live Tracking: Update user location in DB when coordinates change
    useEffect(() => {
        if (coordinates) {
            updateUserLocation(coordinates.latitude, coordinates.longitude)
        }
    }, [coordinates])

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
                    userLat={coordinates.latitude}
                    userLng={coordinates.longitude}
                    onSuccess={handleRefresh}
                />
            )}

            {/* 🌍 Full Screen Map */}
            <div className="absolute inset-0 z-0">
                <Map
                    currentUserId={userId}
                    userType={userType}
                    refreshTrigger={refreshTrigger}
                />
            </div>

            {/* 🧭 Floating Action Button (FAB) for Quick Actions */}
            <div className="absolute bottom-24 right-5 z-40 flex flex-col items-center gap-3">
                <AnimatePresence>
                    {isFabOpen && (
                        <>
                            <motion.button
                                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                                transition={{ delay: 0.1 }}
                                onClick={() => { setIsStoryOpen(true); setIsFabOpen(false) }}
                                className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center text-white shadow-lg border border-pink-400"
                                title="نشر قصة"
                            >
                                <Video size={20} />
                            </motion.button>
                            <motion.button
                                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                                transition={{ delay: 0.05 }}
                                // UPDATED: Open Post Modal instead of Request Modal
                                onClick={() => { setIsPostOpen(true); setIsFabOpen(false) }}
                                className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white shadow-lg border border-purple-500"
                                title="منشور جديد"
                            >
                                <MessageSquarePlus size={20} />
                            </motion.button>
                            <motion.button
                                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                                onClick={() => { setIsAddProductOpen(true); setIsFabOpen(false) }}
                                className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg border border-blue-500"
                                title="إضافة منتج"
                            >
                                <ShoppingBag size={20} />
                            </motion.button>
                        </>
                    )}
                </AnimatePresence>

                <button
                    onClick={() => setIsFabOpen(!isFabOpen)}
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(59,130,246,0.5)] border-2 border-white/20 transition-all active:scale-95 ${isFabOpen ? 'bg-red-500 rotate-45' : 'bg-indigo-600 hover:scale-105'
                        }`}
                >
                    <Plus size={28} strokeWidth={2.5} />
                </button>
            </div>

            {/* 📱 Bottom Navigation */}
            <BottomNav />
        </div>
    )
}
