'use client'

import { useState } from 'react'
import { Video, Image, ShoppingBag, Megaphone, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export type FilterType = 'VIDEO' | 'IMAGE' | 'PRODUCT' | 'REQUEST'
export const ALL_FILTERS: FilterType[] = ['VIDEO', 'IMAGE', 'PRODUCT', 'REQUEST']

interface Props {
    selectedFilters: FilterType[]
    onToggle: (filter: FilterType) => void
    userAvatar?: string | null
    userName?: string | null
}

export function MapFilterBar({ selectedFilters, onToggle, userAvatar, userName }: Props) {
    const [isHovered, setIsHovered] = useState(false)
    const isSelected = (type: FilterType) => selectedFilters.includes(type)

    const buttons = [
        { type: 'VIDEO' as const, icon: Video, label: 'فيديو', color: 'bg-purple-600' },
        { type: 'IMAGE' as const, icon: Image, label: 'صور', color: 'bg-pink-600' },
        { type: 'PRODUCT' as const, icon: ShoppingBag, label: 'منتجات', color: 'bg-indigo-600' },
        { type: 'REQUEST' as const, icon: Megaphone, label: 'طلبات', color: 'bg-orange-600' }
    ]

    return (
        <div
            className="absolute top-4 left-4 z-[1000] flex flex-col items-start gap-2"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* User Trigger Icon */}
            <button
                className="w-12 h-12 bg-black/40 backdrop-blur-md border-2 border-white/20 rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform overflow-hidden z-10"
                onClick={() => setIsHovered(!isHovered)}
                title="تصفية الخريطة"
            >
                {userAvatar ? (
                    <img src={userAvatar} alt={userName || 'User'} className="w-full h-full object-cover" />
                ) : (
                    <User size={24} className="text-white shadow-sm" />
                )}
            </button>

            {/* Horizontal Pop-out Menu */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-full flex gap-2 shadow-xl origin-top-left"
                        dir="rtl"
                    >
                        {buttons.map((btn, i) => (
                            <motion.button
                                key={btn.type}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => onToggle(btn.type)}
                                className={`
                                    relative group p-2 rounded-full transition-all duration-300
                                    ${isSelected(btn.type) ? `${btn.color} text-white shadow-lg scale-110` : 'bg-black/20 text-white/70 hover:bg-black/40 hover:text-white'}
                                `}
                                title={btn.label}
                            >
                                <btn.icon size={20} />

                                {/* Tooltip */}
                                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                    {btn.label}
                                </span>
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
