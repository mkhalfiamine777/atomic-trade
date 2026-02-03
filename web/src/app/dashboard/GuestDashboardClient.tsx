'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { LogIn, UserPlus } from 'lucide-react'

// Dynamically import Map to avoid SSR issues
const Map = dynamic(() => import('@/components/Map'), {
    ssr: false,
    loading: () => <div className="h-[600px] w-full bg-zinc-900 rounded-xl animate-pulse" />
})

export default function GuestDashboardClient() {
    return (
        <div className="min-h-screen bg-zinc-950 p-8">
            <header className="mb-8 text-right">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-amber-600 bg-clip-text text-transparent">
                    أهلا بك في مسيرتنا للبحث عن الثروة 🏴‍☠️💰
                </h1>
                <p className="text-zinc-400">استكشف الفرص من حولك قبل أن تنضم إلينا.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Map Area */}
                <div className="lg:col-span-2 space-y-4 relative">
                    <div className="flex justify-between items-center text-white mb-2">
                        <span className="text-sm bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full border border-purple-600/30">
                            👀 وضع الزائر (المشاهدة فقط)
                        </span>
                        <h2 className="text-xl font-semibold">خريطة الحي</h2>
                    </div>

                    <div className="relative">
                        <Map currentUserId={null} />

                        {/* Neon Overlay Buttons */}
                        <div className="absolute bottom-6 left-6 z-[1000] flex flex-col gap-3 pointer-events-auto">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <Link
                                    href="/signup"
                                    className="px-6 py-3 rounded-full font-bold text-white bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.5)] border border-indigo-400 hover:scale-105 transition-transform flex items-center gap-2"
                                >
                                    <UserPlus className="w-5 h-5" />
                                    <span>انضم إلينا الآن</span>
                                </Link>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                            >
                                <Link
                                    href="/login"
                                    className="px-6 py-3 rounded-full font-bold text-indigo-300 bg-zinc-900/80 backdrop-blur shadow-lg border border-indigo-500/30 hover:bg-zinc-800 transition-colors flex items-center gap-2"
                                >
                                    <LogIn className="w-5 h-5" />
                                    <span>تسجيل الدخول</span>
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Sidebar / Stats */}
                <div className="space-y-6">
                    {/* Locked Stats */}
                    <div className="grid grid-cols-2 gap-4 opacity-50 blur-[1px] select-none">
                        <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 text-center">
                            <div className="text-2xl font-bold text-zinc-600">--</div>
                            <div className="text-xs text-zinc-600">مبيعات اليوم</div>
                        </div>
                        <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 text-center">
                            <div className="text-2xl font-bold text-zinc-600">--</div>
                            <div className="text-xs text-zinc-600">تنبيهات قرب</div>
                        </div>
                    </div>

                    {/* Locked Action Cards */}
                    <div className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800 space-y-4 text-right relative overflow-hidden">
                        {/* Lock Overlay */}
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-center p-4">
                            <div className="bg-zinc-800 p-3 rounded-full mb-3 shadow-xl border border-zinc-700">
                                🔒
                            </div>
                            <h3 className="text-white font-bold mb-1">الميزات مقفلة</h3>
                            <p className="text-sm text-zinc-400 mb-4">سجل لتبدأ البيع والشراء</p>
                        </div>

                        <button
                            disabled
                            className="w-full bg-zinc-800 text-zinc-500 py-3 rounded-lg flex items-center justify-center gap-2 cursor-not-allowed"
                        >
                            <span>🛍️</span>
                            <span>إضافة منتج جديد</span>
                        </button>

                        <button
                            disabled
                            className="w-full bg-zinc-800 text-zinc-500 py-3 rounded-lg flex items-center justify-center gap-2 cursor-not-allowed"
                        >
                            <span>📣</span>
                            <span>أطلب ما تحتاج</span>
                        </button>

                        <button
                            disabled
                            className="w-full bg-zinc-800 text-zinc-500 py-3 rounded-lg flex items-center justify-center gap-2 cursor-not-allowed"
                        >
                            <span>📢</span>
                            <span>نشر قصة</span>
                        </button>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 p-6 rounded-xl border border-indigo-700/30 text-right">
                        <h3 className="text-lg font-semibold text-indigo-400 mb-2">
                            💎 لماذا تسجل؟
                        </h3>
                        <ul className="text-sm text-zinc-400 space-y-2 list-disc list-inside">
                            <li>بيع منتجاتك لجيرانك مجاناً</li>
                            <li>احصل على تنبيهات للصفقات القريبة (50 متر)</li>
                            <li>شارك قصصك التجارية واكسب الزبائن</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
