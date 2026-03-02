'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSocket } from '@/hooks/useSocket'
import { Bell, X, ShoppingBag, Megaphone, Target } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotificationStore } from '@/store/useNotificationStore'
import Link from 'next/link'

export function NotificationBell() {
    const { socket } = useSocket()
    const router = useRouter()

    // Use the global persistent notification store
    const { notifications, addNotification, markAsRead, markAllAsRead, clearAll, dismissPopout } = useNotificationStore()

    const [isOpen, setIsOpen] = useState(false)
    const [hasNewFlash, setHasNewFlash] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const unreadCount = notifications.filter(n => !n.read).length

    const handleNotificationClick = (notif: any) => {
        // Mark as read
        markAsRead(notif.id)
        setIsOpen(false)

        // Navigate to the specific listing that caused the match
        if (notif.data?.listingId) {
            router.push(`/dashboard?focus=${notif.data.listingId}`)
        }
    }

    // Listen for match_found events
    useEffect(() => {
        if (!socket) return

        const handleMatch = (data: any) => {
            addNotification({
                type: 'MATCH_FOUND',
                title: 'تطابق جديد!',
                message: data.message,
                data: data
            })
            setHasNewFlash(true)
            setTimeout(() => setHasNewFlash(false), 2000)
        }

        socket.on('match_found', handleMatch)
        return () => { socket.off('match_found', handleMatch) }
    }, [socket, addNotification])

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])



    const getIcon = (type: string) => {
        if (type.includes('PRODUCT') || type === 'sellers_found' || type === 'new_product') return <ShoppingBag className="w-5 h-5 text-emerald-500" />
        if (type.includes('REQUEST') || type === 'new_request') return <Megaphone className="w-5 h-5 text-purple-400" />
        if (type === 'buyers_found') return <Target className="w-5 h-5 text-blue-400" />
        return <Bell className="w-5 h-5 text-zinc-400" />
    }

    const formatTime = (ts: number) => {
        const diff = Date.now() - ts
        const mins = Math.floor(diff / 60000)
        if (mins < 1) return 'الآن'
        if (mins < 60) return `منذ ${mins} د`
        const hours = Math.floor(mins / 60)
        if (hours < 24) return `منذ ${hours} س`
        return `منذ ${Math.floor(hours / 24)} ي`
    }

    const popouts = notifications.filter(n => n.isPopout).slice(0, 3);

    // Don't render if no notifications ever received
    if (notifications.length === 0 && !isOpen) {
        return (
            <button
                className="relative p-2.5 rounded-full hover:bg-white/5 transition-colors text-zinc-500"
                title="الإشعارات"
            >
                <Bell size={20} />
            </button>
        )
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => { setIsOpen(!isOpen); if (!isOpen) markAllAsRead() }}
                className={`relative p-2.5 rounded-full transition-all ${hasNewFlash
                    ? 'bg-emerald-500/20 text-emerald-400 animate-bounce'
                    : unreadCount > 0
                        ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                        : 'bg-zinc-900/80 backdrop-blur border border-white/10 hover:bg-white/5 text-zinc-400 hover:text-white'
                    }`}
                title="الإشعارات"
            >
                <Bell size={20} />

                {/* Badge */}
                <AnimatePresence>
                    {unreadCount > 0 && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 shadow-lg shadow-red-500/50 outline outline-2 outline-black"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </motion.span>
                    )}
                </AnimatePresence>
            </button>

            {/* 🔥 Elegant Popouts (sliding out from the Bell to the left) */}
            <div className="absolute top-0 right-full mr-4 flex flex-col items-end gap-3 pointer-events-none z-[1000]">
                <AnimatePresence>
                    {popouts.map(popout => {
                        const isPrimary = popout.type.includes('REQUEST');
                        return (
                            <motion.div
                                key={`popout-${popout.id}`}
                                initial={{ opacity: 0, x: 20, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9, x: 20 }}
                                className={`pointer-events-auto flex items-center gap-3 backdrop-blur-xl pl-2 pr-4 py-2.5 rounded-[2rem] shadow-2xl border ${isPrimary
                                        ? 'bg-gradient-to-r from-purple-900/90 to-fuchsia-900/90 border-purple-500/40 text-purple-50 shadow-purple-900/50'
                                        : 'bg-[#d8f5ec]/95 border-emerald-400/50 text-emerald-900 shadow-emerald-900/20'
                                    }`}
                                dir="rtl"
                            >
                                <div className="flex flex-col">
                                    <h4 className="font-bold text-sm tracking-tight">{popout.title}</h4>
                                    <p className={`text-xs ${isPrimary ? 'text-purple-200' : 'text-emerald-700 font-medium'}`}>{popout.message}</p>
                                </div>
                                <div className={`shrink-0 p-1.5 rounded-full ${isPrimary ? 'bg-purple-800/50' : 'bg-emerald-500/20'}`}>
                                    {getIcon(popout.type)}
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); dismissPopout(popout.id) }}
                                    className={`ml-1 p-1 hover:scale-110 transition-transform rounded-full ${isPrimary ? 'text-purple-300 hover:text-white hover:bg-white/10' : 'text-emerald-600 hover:text-emerald-900 hover:bg-black/5'}`}
                                >
                                    <X size={16} />
                                </button>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
            </div>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 top-full mt-2 w-80 max-h-96 overflow-hidden rounded-2xl bg-zinc-900/95 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50 z-[999]"
                        dir="rtl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <h4 className="text-sm font-bold text-white">🔔 الإشعارات</h4>
                            <div className="flex items-center gap-2">
                                {notifications.length > 0 && (
                                    <button
                                        onClick={() => { clearAll(); setIsOpen(false); }}
                                        className="text-[10px] text-zinc-500 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10"
                                    >
                                        مسح الكل
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 hover:bg-white/10 rounded-full transition-colors text-zinc-500"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Notification List */}
                        <div className="overflow-y-auto max-h-72">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-zinc-500 text-sm">
                                    لا توجد إشعارات
                                </div>
                            ) : (
                                notifications.map(notif => (
                                    <div
                                        key={notif.id}
                                        onClick={() => handleNotificationClick(notif)}
                                        className={`flex items-start gap-3 p-3 border-b border-white/5 transition-colors hover:bg-white/5 cursor-pointer ${!notif.read ? 'bg-emerald-500/5' : ''
                                            }`}
                                    >
                                        <div className="mt-1 p-1.5 rounded-lg bg-white/5">
                                            {getIcon(notif.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-zinc-200 leading-relaxed">
                                                {notif.message}
                                            </p>
                                            <span className="text-[10px] text-zinc-500 mt-1 block">
                                                {formatTime(notif.timestamp)}
                                            </span>
                                        </div>
                                        {!notif.read && (
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0" />
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* View All Link */}
                        <div className="p-2 border-t border-white/10 bg-black/20">
                            <Link href="/notifications" onClick={() => setIsOpen(false)} className="block w-full text-center py-2 text-xs font-bold text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors">
                                عرض سجل الإشعارات الكامل
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
