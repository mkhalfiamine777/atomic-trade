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
    const { notifications, addNotification, markAsRead, markAllAsRead, clearAll, dismissPopout, deleteNotification } = useNotificationStore()


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

    const popouts = notifications.filter(n => n.isPopout).slice(0, 1);

    // Auto-dismiss popouts after 6 seconds (also handles stale ones from localStorage)
    useEffect(() => {
        const activePopouts = notifications.filter(n => n.isPopout);
        if (activePopouts.length === 0) return;

        const timers = activePopouts.map(p =>
            setTimeout(() => dismissPopout(p.id), 6000)
        );
        return () => timers.forEach(t => clearTimeout(t));
    }, [notifications, dismissPopout]);

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

            {/* 🔥 Compact Pill Notification (slides beside the bell) */}
            <div className="absolute top-1/2 -translate-y-1/2 right-full mr-2 flex flex-col items-end gap-2 pointer-events-none z-[1000]">
                <AnimatePresence>
                    {popouts.slice(0, 1).map(popout => (
                        <motion.div
                            key={`popout-${popout.id}`}
                            initial={{ opacity: 0, y: -8, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -4, scale: 0.95 }}
                            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                            onClick={() => dismissPopout(popout.id)}
                            className="pointer-events-auto cursor-pointer relative overflow-hidden flex items-center gap-2 bg-zinc-900/90 backdrop-blur-xl px-3 py-2 rounded-full shadow-lg border border-white/10 hover:border-white/20 transition-all max-w-[200px]"
                            dir="rtl"
                        >
                            <div className={`shrink-0 w-2 h-2 rounded-full ${popout.type.includes('REQUEST') ? 'bg-purple-400 shadow-[0_0_6px_rgba(168,85,247,0.6)]' : 'bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.6)]'
                                }`} />
                            <span className="text-[11px] font-medium text-zinc-200 truncate">{popout.title}</span>
                            {/* Auto-dismiss progress bar */}
                            <motion.div
                                initial={{ scaleX: 1 }}
                                animate={{ scaleX: 0 }}
                                transition={{ duration: 6, ease: 'linear' }}
                                className={`absolute bottom-0 left-0 right-0 h-[2px] origin-right ${popout.type.includes('REQUEST') ? 'bg-purple-500/60' : 'bg-emerald-500/60'
                                    }`}
                            />
                        </motion.div>
                    ))}
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
                        className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-hidden rounded-2xl bg-zinc-900/95 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50 z-[999]"
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
                                        className={`group/notif flex items-start gap-3 p-3 border-b border-white/5 transition-colors hover:bg-white/5 cursor-pointer ${!notif.read ? 'bg-emerald-500/5' : ''
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
                                        <button
                                            onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                                            className="p-1 rounded-full hover:bg-red-500/20 text-zinc-600 hover:text-red-400 transition-all opacity-0 group-hover/notif:opacity-100 shrink-0"
                                            title="حذف"
                                        >
                                            <X size={12} />
                                        </button>
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
