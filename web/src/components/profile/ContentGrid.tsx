'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Play, Heart, MessageCircle, Layers } from 'lucide-react'
import { getProfileContent, ProfileContentItem } from '@/actions/profile'
import { motion } from 'framer-motion'

interface ContentGridProps {
    userId: string
    userName?: string | null
}

export function ContentGrid({ userId, userName }: ContentGridProps) {
    const [items, setItems] = useState<ProfileContentItem[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)

    useEffect(() => {
        const loadContent = async () => {
            try {
                const data = await getProfileContent(userId, 1)
                setItems(data)
                if (data.length < 20) setHasMore(false)
            } finally {
                setLoading(false)
            }
        }
        loadContent()
    }, [userId])

    if (loading) {
        return <GridSkeleton />
    }

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
                    <Layers size={32} className="text-zinc-600" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">لا يوجد محتوى بعد</h3>
                <p className="text-zinc-500 max-w-xs">
                    لم يقم {userName || 'المستخدم'} بنشر أي فيديوهات أو صور حتى الآن.
                </p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-0.5 md:gap-4 pb-20">
            {items.map((item, index) => (
                <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative aspect-[9/16] group cursor-pointer bg-zinc-900 overflow-hidden md:rounded-xl"
                >
                    {/* Thumbnail */}
                    <Image
                        src={item.thumbnailUrl || item.mediaUrl} // Fallback to mediaUrl if no thumb
                        alt={item.caption || 'Media'}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Meta Data (Likes/Comments) */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 flex justify-between items-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-4 group-hover:translate-y-0">
                        <div className="flex items-center gap-1 text-xs font-bold">
                            <Play size={12} fill="white" />
                            <span>{formatNumber(item.likesCount)}</span>
                        </div>
                    </div>

                    {/* Video Icon Indicator */}
                    {item.type === 'VIDEO' && (
                        <div className="absolute top-2 right-2">
                            <Play size={16} fill="white" className="drop-shadow-md" />
                        </div>
                    )}
                </motion.div>
            ))}
        </div>
    )
}

function GridSkeleton() {
    return (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-0.5 md:gap-4">
            {[...Array(9)].map((_, i) => (
                <div key={i} className="aspect-[9/16] bg-zinc-900 animate-pulse md:rounded-xl" />
            ))}
        </div>
    )
}

function formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
}
