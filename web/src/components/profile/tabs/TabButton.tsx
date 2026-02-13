import React from 'react'
import { motion } from 'framer-motion'

interface TabButtonProps {
    isActive: boolean
    onClick: () => void
    icon: React.ReactNode
    label: string
    count: number
}

export function TabButton({ isActive, onClick, icon, label, count }: TabButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`flex-1 flex items-center justify-center gap-2 py-4 px-2 relative transition-colors ${isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
            {icon}
            <span className="font-bold text-sm">{label}</span>
            <span className="text-xs bg-zinc-800 px-1.5 py-0.5 rounded-full text-zinc-400">{count}</span>

            {isActive && (
                <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"
                />
            )}
        </button>
    )
}
