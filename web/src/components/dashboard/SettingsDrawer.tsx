'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
    X,
    LogOut,
    User,
    ShoppingBag,
    MessageSquarePlus,
    Video,
    Megaphone,
    Map,
    Bell,
    Wallet,
    Eye,
    EyeOff,
    Swords,
    Shield
} from 'lucide-react'
import { logout } from '@/actions/auth'
import { useRouter } from 'next/navigation'

interface SettingsDrawerProps {
    isOpen: boolean
    onClose: () => void
    userName?: string | null
    userType?: string
    onOpenAction: (action: 'PRODUCT' | 'REQUEST' | 'POST' | 'STORY') => void
    isLocationVisible?: boolean
    onToggleLocation?: () => void
    showZoneGrid?: boolean
    onToggleZoneGrid?: () => void
}

export function SettingsDrawer({
    isOpen,
    onClose,
    userName,
    userType,
    onOpenAction,
    isLocationVisible = true,
    onToggleLocation,
    showZoneGrid = false,
    onToggleZoneGrid
}: SettingsDrawerProps) {
    const router = useRouter()

    const handleLogout = async () => {
        await logout()
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 z-[2001] w-80 bg-zinc-900/95 backdrop-blur-xl border-l border-white/10 shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                    {userName ? userName[0].toUpperCase() : 'U'}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-sm">{userName || 'مستخدم'}</h3>
                                    <span className="text-xs text-zinc-400 capitalize">{userType || 'Individual'}</span>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-6">

                            {/* Quick Actions */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-semibold text-zinc-500 px-2">إجراءات سريعة</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <ActionButton
                                        icon={ShoppingBag}
                                        label="إضافة منتج"
                                        color="blue"
                                        onClick={() => { onOpenAction('PRODUCT'); onClose() }}
                                    />
                                    <ActionButton
                                        icon={Megaphone}
                                        label="طلب جديد"
                                        color="orange"
                                        onClick={() => { onOpenAction('REQUEST'); onClose() }}
                                    />
                                    <ActionButton
                                        icon={MessageSquarePlus}
                                        label="منشور جديد"
                                        color="purple"
                                        onClick={() => { onOpenAction('POST'); onClose() }}
                                    />
                                    <ActionButton
                                        icon={Video}
                                        label="قصة جديدة"
                                        color="pink"
                                        onClick={() => { onOpenAction('STORY'); onClose() }}
                                    />
                                </div>
                            </div>

                            {/* Settings Section */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-semibold text-zinc-500 px-2">الإعدادات</h4>

                                {/* 👻 Location Visibility Toggle */}
                                <button
                                    onClick={onToggleLocation}
                                    className={`flex items-center justify-between w-full p-3 rounded-xl transition-colors ${!isLocationVisible ? 'bg-red-500/10 text-red-400' : 'hover:bg-white/5 text-zinc-300 hover:text-white'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {isLocationVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                                        <span className="text-sm font-medium">
                                            {isLocationVisible ? 'مشاركة الموقع' : 'الموقع مخفي'}
                                        </span>
                                    </div>
                                    <div className={`w-8 h-5 rounded-full p-1 transition-colors ${isLocationVisible ? 'bg-indigo-600' : 'bg-red-500/20'}`}>
                                        <motion.div
                                            className="w-3 h-3 bg-white rounded-full shadow-sm"
                                            animate={{ x: isLocationVisible ? 12 : 0 }}
                                        />
                                    </div>
                                </button>

                                {/* 🏰 Zone Grid Toggle */}
                                <button
                                    onClick={onToggleZoneGrid}
                                    className={`flex items-center justify-between w-full p-3 rounded-xl transition-colors ${showZoneGrid ? 'bg-cyan-500/10 text-cyan-400' : 'hover:bg-white/5 text-zinc-300 hover:text-white'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {showZoneGrid ? <Swords size={18} /> : <Shield size={18} />}
                                        <span className="text-sm font-medium">
                                            {showZoneGrid ? 'وضع السيطرة ⚔️' : 'إظهار المناطق'}
                                        </span>
                                    </div>
                                    <div className={`w-8 h-5 rounded-full p-1 transition-colors ${showZoneGrid ? 'bg-cyan-600' : 'bg-zinc-700'}`}>
                                        <motion.div
                                            className="w-3 h-3 bg-white rounded-full shadow-sm"
                                            animate={{ x: showZoneGrid ? 12 : 0 }}
                                        />
                                    </div>
                                </button>

                                <MenuItem icon={Map} label="نوع الخريطة" onClick={() => { }} disabled badge="قريباً" />
                                <MenuItem icon={Bell} label="الإشعارات" onClick={() => { }} disabled badge="قريباً" />
                                <MenuItem icon={Wallet} label="المحفظة" onClick={() => { }} disabled badge="قريباً" />
                            </div>

                        </div>

                        {/* Footer / Logout */}
                        <div className="p-4 border-t border-white/10 mt-auto">
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors"
                            >
                                <LogOut size={20} />
                                <span className="font-medium">تسجيل الخروج</span>
                            </button>
                        </div>

                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

// Sub-components for cleaner code
function ActionButton({ icon: Icon, label, color, onClick }: any) {
    const colors: any = {
        blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20',
        orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20',
        purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20',
        pink: 'bg-pink-500/10 text-pink-400 border-pink-500/20 hover:bg-pink-500/20',
    }

    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all active:scale-95 ${colors[color]}`}
        >
            <Icon size={24} />
            <span className="text-xs font-medium">{label}</span>
        </button>
    )
}

function MenuItem({ icon: Icon, label, onClick, disabled, badge }: any) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`flex items-center justify-between w-full p-3 rounded-xl transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/5 text-zinc-300 hover:text-white'
                }`}
        >
            <div className="flex items-center gap-3">
                <Icon size={18} />
                <span className="text-sm font-medium">{label}</span>
            </div>
            {badge && (
                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-zinc-400">{badge}</span>
            )}
        </button>
    )
}
