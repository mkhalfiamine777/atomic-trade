'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSocket } from '@/hooks/useSocket'
import { Bell, X, ShoppingBag, Megaphone, Target } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface MatchNotification {
    id: string
    type: 'buyers_found' | 'sellers_found' | 'new_product' | 'new_request'
    message: string
    category: string
    subcategory: string
    listingId: string
    timestamp: string
    read: boolean
}

export function NotificationBell() {
    const { socket } = useSocket()
    const router = useRouter()
    const [notifications, setNotifications] = useState<MatchNotification[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [hasNewFlash, setHasNewFlash] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const unreadCount = notifications.filter(n => !n.read).length

    const handleNotificationClick = (notif: MatchNotification) => {
        // Mark as read
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n))
        setIsOpen(false)

        // Navigate to the specific listing that caused the match
        if (notif.listingId) {
            // In this app, viewing a listing happens via the dashboard query parameters
            // or specialized pages. We will point to dashboard focus.
            router.push(`/dashboard?focus=${notif.listingId}`)
        }
    }

    // Listen for match_found events
    useEffect(() => {
        if (!socket) return

        const handleMatch = (data: Omit<MatchNotification, 'id' | 'read'>) => {
            const newNotif: MatchNotification = {
                ...data,
                id: `notif-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                read: false
            }

            setNotifications(prev => [newNotif, ...prev].slice(0, 20)) // Keep max 20
            setHasNewFlash(true)
            setTimeout(() => setHasNewFlash(false), 2000)
        }

        socket.on('match_found', handleMatch)
        return () => { socket.off('match_found', handleMatch) }
    }, [socket])

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

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    }

    const clearAll = () => {
        setNotifications([])
        setIsOpen(false)
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'buyers_found': return <Target className="w-4 h-4 text-emerald-400" />
            case 'sellers_found': return <ShoppingBag className="w-4 h-4 text-blue-400" />
            case 'new_product': return <ShoppingBag className="w-4 h-4 text-amber-400" />
            case 'new_request': return <Megaphone className="w-4 h-4 text-purple-400" />
            default: return <Bell className="w-4 h-4 text-zinc-400" />
        }
    }

    const formatTime = (ts: string) => {
        const diff = Date.now() - new Date(ts).getTime()
        const mins = Math.floor(diff / 60000)
        if (mins < 1) return 'الآن'
        if (mins < 60) return `منذ ${mins} د`
        const hours = Math.floor(mins / 60)
        if (hours < 24) return `منذ ${hours} س`
        return `منذ ${Math.floor(hours / 24)} ي`
    }

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
                onClick={() => { setIsOpen(!isOpen); if (!isOpen) markAllRead() }}
                className={`relative p-2.5 rounded-full transition-all ${hasNewFlash
                    ? 'bg-emerald-500/20 text-emerald-400 animate-bounce'
                    : unreadCount > 0
                        ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                        : 'hover:bg-white/5 text-zinc-400 hover:text-white'
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
                            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-emerald-500 text-black text-[10px] font-bold rounded-full px-1 shadow-lg shadow-emerald-500/50"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </motion.span>
                    )}
                </AnimatePresence>
            </button>

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
                                        onClick={clearAll}
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
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
