'use client'

// useState removed
import { Video, Image, ShoppingBag, Megaphone } from 'lucide-react'

export type FilterType = 'VIDEO' | 'IMAGE' | 'PRODUCT' | 'REQUEST'
export const ALL_FILTERS: FilterType[] = ['VIDEO', 'IMAGE', 'PRODUCT', 'REQUEST']

interface Props {
    selectedFilters: FilterType[]
    onToggle: (filter: FilterType) => void
}

export function MapFilterBar({ selectedFilters, onToggle }: Props) {
    const isSelected = (type: FilterType) => selectedFilters.includes(type)

    const buttons = [
        { type: 'VIDEO' as const, icon: Video, label: 'فيديو', color: 'bg-purple-600' },
        { type: 'IMAGE' as const, icon: Image, label: 'صور', color: 'bg-pink-600' },
        { type: 'PRODUCT' as const, icon: ShoppingBag, label: 'منتجات', color: 'bg-indigo-600' },
        { type: 'REQUEST' as const, icon: Megaphone, label: 'طلبات', color: 'bg-orange-600' }
    ]

    return (
        <div className="absolute top-4 left-14 z-[1000] flex gap-2" dir="rtl">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-full flex gap-2 shadow-xl">
                {buttons.map(btn => (
                    <button
                        key={btn.type}
                        onClick={() => onToggle(btn.type)}
                        className={`
                            relative group p-2 rounded-full transition-all duration-300
                            ${isSelected(btn.type) ? `${btn.color} text-white shadow-lg scale-110` : 'bg-black/20 text-white/70 hover:bg-black/40'}
                        `}
                        title={btn.label}
                    >
                        <btn.icon size={20} />

                        {/* Tooltip */}
                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            {btn.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    )
}
