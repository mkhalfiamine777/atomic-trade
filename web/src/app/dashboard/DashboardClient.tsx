'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AddProductModal } from '@/components/AddProductModal'
import { CreateRequestModal } from '@/components/CreateRequestModal'
import { CreateStoryModal } from '@/components/CreateStoryModal'
import { useGeolocation } from '@/hooks/useGeolocation'
import { updateUserLocation } from '@/actions/user'
import { useEffect } from 'react'

// Dynamically import Map to avoid SSR issues
const Map = dynamic(() => import('@/components/Map'), {
    ssr: false,
    loading: () => <div className="h-[600px] w-full bg-zinc-900 rounded-xl animate-pulse" />
})

export default function DashboardClient({
    userId,
    userType
}: {
    userId: string
    userType: string
    userName?: string | null
}) {
    const [isAddProductOpen, setIsAddProductOpen] = useState(false)
    const [isRequestOpen, setIsRequestOpen] = useState(false)
    const [isStoryOpen, setIsStoryOpen] = useState(false)
    const [refreshTrigger, setRefreshTrigger] = useState(0)
    const router = useRouter()

    const handleRefresh = () => setRefreshTrigger(prev => prev + 1)

    const { coordinates } = useGeolocation()

    // Live Tracking: Update user location in DB when coordinates change
    useEffect(() => {
        if (coordinates) {
            // Simple optimization: only update if we have valid coords
            // Next.js Server Actions are distinct, essentially an API call.
            updateUserLocation(coordinates.latitude, coordinates.longitude)
        }
    }, [coordinates])

    return (
        <div className="min-h-screen bg-zinc-950 p-8">
            <AddProductModal
                isOpen={isAddProductOpen}
                onClose={() => setIsAddProductOpen(false)}
                onSuccess={handleRefresh}
            />
            <CreateRequestModal isOpen={isRequestOpen} onClose={() => setIsRequestOpen(false)} />

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
            <header className="mb-8 text-right">
                <h1 className="text-3xl font-bold text-white">لوحة القيادة 🕹️</h1>
                <p className="text-zinc-400">نظرة عامة على نشاطك في الحي</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Map Area */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center text-white mb-2">
                        <span className="text-sm bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full border border-blue-600/30">
                            📡 التتبع الحي مفعل
                        </span>
                        <h2 className="text-xl font-semibold">خريطة الحي</h2>
                    </div>
                    <Map
                        currentUserId={userId}
                        userType={userType}
                        refreshTrigger={refreshTrigger}
                    />
                </div>

                {/* Sidebar / Stats */}
                <div className="space-y-6">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 text-center">
                            <div className="text-2xl font-bold text-green-400">0</div>
                            <div className="text-xs text-zinc-500">مبيعات اليوم</div>
                        </div>
                        <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 text-center">
                            <div className="text-2xl font-bold text-orange-400">0</div>
                            <div className="text-xs text-zinc-500">تنبيهات قرب</div>
                        </div>
                    </div>

                    {/* Action Cards */}
                    <div className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800 space-y-4 text-right">
                        <h3 className="text-lg font-semibold text-white">إجراءات سريعة</h3>

                        <button
                            onClick={() => router.push(`/u/${userId}`)}
                            className="w-full bg-white/5 hover:bg-white/10 text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-colors border border-white/10"
                        >
                            <span>👤</span>
                            <span>زيارة ملفي الشخصي</span>
                        </button>

                        <button
                            onClick={() => setIsAddProductOpen(true)}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                        >
                            <span>🛍️</span>
                            <span>إضافة منتج جديد</span>
                        </button>

                        <button
                            onClick={() => setIsRequestOpen(true)}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-[0_0_15px_rgba(147,51,234,0.3)] border border-purple-500/30"
                        >
                            <span>📣</span>
                            <span>أطلب ما تحتاج (Reverse Market)</span>
                        </button>

                        <button
                            onClick={() => setIsStoryOpen(true)}
                            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-colors border border-green-500/20"
                        >
                            <span>📢</span>
                            <span>نشر قصة (Map Story)</span>
                        </button>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 p-6 rounded-xl border border-yellow-700/30 text-right">
                        <h3 className="text-lg font-semibold text-yellow-500 mb-2">
                            👑 مول الحومة
                        </h3>
                        <p className="text-sm text-zinc-400 mb-4">
                            أنت لست المسيطر على هذا الحي بعد. ابدأ بالبيع لتكسب النقاط!
                        </p>
                        <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                            <div className="bg-yellow-600 h-full w-[10%]"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
