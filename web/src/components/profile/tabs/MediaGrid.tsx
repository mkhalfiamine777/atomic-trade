'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Heart, MessageCircle, Image as ImageIcon } from 'lucide-react'
import { TabStory, TabPost } from '@/types'
import { EmptyState } from './EmptyState'

interface MediaGridProps {
    stories: TabStory[]
    posts: TabPost[]
    onPostClick: (post: TabPost) => void
}

type GridItem = {
    id: string
    mediaUrl: string
    mediaType: 'IMAGE' | 'VIDEO'
    caption?: string | null
    _type: 'STORY' | 'POST'
}

function GridCell({ item, index, onClick }: { item: GridItem; index: number; onClick: () => void }) {
    const [isHovered, setIsHovered] = useState(false)
    const isVideo = item.mediaType === 'VIDEO' || item.mediaUrl?.endsWith('.mp4')

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.04 }}
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="aspect-[9/16] relative bg-zinc-900/80 rounded-lg overflow-hidden cursor-pointer group border border-white/5 hover:border-white/20 transition-all duration-300"
        >
            {/* Media Content */}
            {isVideo ? (
                <video
                    src={item.mediaUrl + '#t=0.1'}
                    className="w-full h-full object-cover pointer-events-none transition-transform duration-500 group-hover:scale-110"
                    preload="metadata"
                    muted
                    playsInline
                />
            ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={item.mediaUrl}
                    alt={item.caption || ''}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                />
            )}

            {/* Gradient Overlay (Always visible at bottom, full on hover) */}
            <div className={`absolute inset-0 transition-opacity duration-300 ${isHovered
                    ? 'bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-100'
                    : 'bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80'
                }`} />

            {/* Top Badges */}
            <div className="absolute top-2 right-2 flex flex-col gap-1.5 pointer-events-none">
                {item._type === 'STORY' && (
                    <div className="bg-purple-500/80 backdrop-blur-sm rounded-full p-1.5 shadow-lg shadow-purple-500/30">
                        <Play className="w-3 h-3 text-white fill-white" />
                    </div>
                )}
                {isVideo && item._type === 'POST' && (
                    <div className="bg-cyan-500/70 backdrop-blur-sm rounded-full p-1.5 shadow-lg shadow-cyan-500/30">
                        <Play className="w-3 h-3 text-white fill-white" />
                    </div>
                )}
                {!isVideo && item._type === 'POST' && (
                    <div className="bg-white/10 backdrop-blur-sm rounded-full p-1.5">
                        <ImageIcon className="w-3 h-3 text-white/70" />
                    </div>
                )}
            </div>

            {/* Bottom Info (Caption Preview on Hover) */}
            <div className={`absolute bottom-0 left-0 right-0 p-2.5 transition-all duration-300 ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
                }`}>
                {item.caption && (
                    <p className="text-[11px] text-white/90 font-medium line-clamp-2 leading-tight">
                        {item.caption}
                    </p>
                )}
            </div>

            {/* Neon Border Glow on Hover */}
            <div className={`absolute inset-0 rounded-lg transition-opacity duration-300 pointer-events-none ${isHovered ? 'opacity-100' : 'opacity-0'
                }`} style={{
                    boxShadow: item._type === 'STORY'
                        ? 'inset 0 0 20px rgba(168, 85, 247, 0.2)'
                        : 'inset 0 0 20px rgba(14, 165, 233, 0.15)'
                }} />
        </motion.div>
    )
}

export function MediaGrid({ stories, posts, onPostClick }: MediaGridProps) {
    const storyItems: GridItem[] = stories.map(s => ({
        id: s.id,
        mediaUrl: s.mediaUrl,
        mediaType: s.mediaType,
        caption: s.caption,
        _type: 'STORY' as const
    }))

    const postItems: GridItem[] = posts.map(p => ({
        id: p.id,
        mediaUrl: p.mediaUrl,
        mediaType: p.mediaType || 'IMAGE',
        caption: p.caption,
        _type: 'POST' as const
    }))

    const items: GridItem[] = [...storyItems, ...postItems]

    if (items.length === 0) return <EmptyState label="لا توجد صور أو فيديوهات" />

    return (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-1 md:gap-1.5 p-1 md:p-2">
            {items.map((item, index) => (
                <GridCell
                    key={item.id}
                    item={item}
                    index={index}
                    onClick={() => onPostClick(item as unknown as TabPost)}
                />
            ))}
        </div>
    )
}
