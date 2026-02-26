'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { LogIn, UserPlus } from 'lucide-react'
import { AuthModal } from '@/components/modals/AuthModal'

// Dynamically import Map to avoid SSR issues
const Map = dynamic(() => import('@/components/map/Map'), {
    ssr: false,
    loading: () => <div className="h-screen w-full bg-zinc-950 flex items-center justify-center"><div className="animate-spin text-purple-500">🌍</div></div>
})

export default function GuestDashboardClient() {
    const [authMode, setAuthMode] = useState<'login' | 'signup' | null>(null)

    return (
        <div className="relative h-screen w-full overflow-hidden bg-zinc-950">
            {/* 🌍 Full Screen Map (Read-Only) */}
            <div className="absolute inset-0 z-0">
                <Map />
            </div>

            {/* 🧭 Guest Overlay Controls */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1001] bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white text-xs font-medium flex items-center gap-2 shadow-xl">
                <span>👀</span>
                <span>وضع الزائر (المشاهدة فقط)</span>
            </div>

            {/* 👇 Floating CTA Buttons */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[1001] flex flex-col items-center gap-4 w-full max-w-sm px-4">
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="w-full"
                >
                    <button
                        onClick={() => setAuthMode('signup')}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-full shadow-[0_4px_20px_rgba(79,70,229,0.4)] flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                        <UserPlus className="w-5 h-5" />
                        <span>انضم إلينا وابدأ التجارة</span>
                    </button>
                </motion.div>

                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                >
                    <button
                        onClick={() => setAuthMode('login')}
                        className="text-white/80 hover:text-white text-sm font-medium flex items-center gap-1 transition-colors bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm"
                    >
                        <span>لديك حساب؟</span>
                        <span className="text-indigo-400 font-bold">سجل الدخول</span>
                    </button>
                </motion.div>
            </div>

            {/* Auth Modal */}
            <AuthModal
                isOpen={!!authMode}
                onClose={() => setAuthMode(null)}
                initialMode={authMode || 'signup'}
            />
        </div>
    )
}
