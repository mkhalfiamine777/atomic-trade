'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, ArrowRight, CheckCircle2, Trash2, ShoppingBag, Megaphone, Target } from 'lucide-react'
import { useNotificationStore } from '@/store/useNotificationStore'

export default function NotificationsPage() {
    const router = useRouter()
    const { notifications, markAsRead, markAllAsRead, clearAll, deleteNotification } = useNotificationStore()
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) return null

    const handleNotificationClick = (notif: any) => {
        if (!notif.read) markAsRead(notif.id)
        if (notif.data?.listingId) {
            router.push(`/dashboard?focus=${notif.data.listingId}`)
        }
    }

    const getIcon = (type: string) => {
        if (type.includes('PRODUCT') || type === 'MATCH_FOUND') return <ShoppingBag className="w-6 h-6 text-emerald-500" />
        if (type.includes('REQUEST')) return <Megaphone className="w-6 h-6 text-purple-400" />
        if (type === 'buyers_found') return <Target className="w-6 h-6 text-blue-400" />
        return <Bell className="w-6 h-6 text-zinc-400" />
    }

    const formatDateTime = (ts: number) => {
        const date = new Date(ts)
        const today = new Date()

        const isToday = date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()

        const timeOptions: Intl.DateTimeFormatOptions = {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }

        const dateOptions: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }

        const timeString = date.toLocaleTimeString('ar-SA', timeOptions)
        const dateString = date.toLocaleDateString('ar-SA', dateOptions)

        if (isToday) {
            return `اليوم، ${timeString}`
        }
        return `${dateString} - ${timeString}`
    }

    const unreadCount = notifications.filter(n => !n.read).length

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100" dir="rtl">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-zinc-900/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 -mr-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-zinc-300"
                        >
                            <ArrowRight size={20} />
                        </button>
                        <div>
                            <h1 className="text-lg font-bold flex items-center gap-2">
                                سجل الإشعارات
                                {unreadCount > 0 && (
                                    <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full font-medium">
                                        {unreadCount} جديد
                                    </span>
                                )}
                            </h1>
                        </div>
                    </div>

                    {notifications.length > 0 && (
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    title="تحديد الكل كمقروء"
                                    className="p-2 hover:bg-emerald-500/10 text-zinc-400 hover:text-emerald-400 rounded-full transition-colors"
                                >
                                    <CheckCircle2 size={20} />
                                </button>
                            )}
                            <button
                                onClick={clearAll}
                                title="مسح الكل"
                                className="p-2 hover:bg-red-500/10 text-zinc-400 hover:text-red-400 rounded-full transition-colors"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* Content */}
            <main className="max-w-2xl mx-auto p-4 pb-24">
                <AnimatePresence mode="popLayout">
                    {notifications.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center py-32 text-center"
                        >
                            <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mb-6">
                                <Bell className="w-10 h-10 text-zinc-700" />
                            </div>
                            <h2 className="text-xl font-bold text-zinc-300 mb-2">لا توجد إشعارات</h2>
                            <p className="text-zinc-500">ستظهر هنا المطابقات والتنبيهات عند اقترابك من المتاجر أو الطلبات.</p>
                        </motion.div>
                    ) : (
                        <div className="space-y-3">
                            {notifications.map((notif, idx) => (
                                <motion.div
                                    key={notif.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2, delay: Math.min(idx * 0.05, 0.3) }}
                                    onClick={() => handleNotificationClick(notif)}
                                    className={`relative overflow-hidden cursor-pointer group rounded-2xl p-4 transition-all duration-300 border ${!notif.read
                                        ? 'bg-zinc-900 border-white/10 shadow-lg'
                                        : 'bg-zinc-900/50 border-white/5 opacity-80 hover:opacity-100 hover:bg-zinc-900'
                                        }`}
                                >
                                    {/* Unread Indicator Line */}
                                    {!notif.read && (
                                        <div className="absolute top-0 bottom-0 right-0 w-1 bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                                    )}

                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-full shrink-0 transition-colors ${!notif.read ? 'bg-zinc-800' : 'bg-transparent border border-white/5'
                                            }`}>
                                            {getIcon(notif.type)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <h3 className={`font-bold truncate ${!notif.read ? 'text-zinc-100' : 'text-zinc-300'}`}>
                                                    {notif.title}
                                                </h3>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <span className="text-xs text-zinc-500 font-medium whitespace-nowrap">
                                                        {formatDateTime(notif.timestamp)}
                                                    </span>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                                                        className="p-1 rounded-full hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                                                        title="حذف"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className={`text-sm leading-relaxed ${!notif.read ? 'text-zinc-300' : 'text-zinc-500'}`}>
                                                {notif.message}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    )
}
