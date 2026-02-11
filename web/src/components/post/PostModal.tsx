'use client'

import React, { useState, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ZoomIn } from 'lucide-react'
import { VideoPlayer } from '@/components/video/VideoPlayer'
import { TabPost } from '@/types'

interface PostModalProps {
    isOpen: boolean
    onClose: () => void
    post: TabPost | null
}

export function PostModal({ isOpen, onClose, post }: PostModalProps) {
    const [isZoomed, setIsZoomed] = useState(false)
    const constraintsRef = useRef(null)
    const isDraggingRef = useRef(false)

    if (!isOpen || !post) return null

    const isVideo = post.mediaType === 'VIDEO'

    // Reset zoom state on new post or close
    // (This simple logic resets when the component unmounts mostly, 
    // but better to control via effect if needed. For now simple is fine.)

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[1000] bg-black text-white flex items-center justify-center p-0 md:p-4"
                onClick={onClose} // Close on backdrop click
            >
                {/* Close Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onClose()
                    }}
                    className="absolute top-4 right-4 z-50 bg-black/50 p-2 rounded-full hover:bg-white/20 transition-colors backdrop-blur-md"
                >
                    <X className="w-6 h-6 text-white" />
                </button>

                {/* Media Container */}
                <div
                    className="relative w-full h-full md:max-w-[500px] md:aspect-[9/16] bg-black overflow-hidden rounded-xl shadow-2xl flex items-center justify-center"
                    onClick={(e) => e.stopPropagation()} // Prevent close on content click
                    ref={constraintsRef}
                >
                    {isVideo ? (
                        <VideoPlayer
                            src={post.mediaUrl}
                            isActive={true}
                        />
                    ) : (
                        <motion.div
                            className={`relative w-full h-full cursor-zoom-in ${isZoomed ? 'cursor-grab active:cursor-grabbing' : ''}`}
                            onClick={() => {
                                if (!isDraggingRef.current) {
                                    setIsZoomed(!isZoomed)
                                }
                            }}
                            animate={{
                                scale: isZoomed ? 2 : 1
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            drag={isZoomed}
                            dragConstraints={{ left: -300, right: 300, top: -300, bottom: 300 }}
                            dragElastic={0.05}
                            onDragStart={() => { isDraggingRef.current = true }}
                            onDragEnd={() => { setTimeout(() => { isDraggingRef.current = false }, 150) }}
                        >
                            <Image
                                src={post.mediaUrl}
                                alt={post.caption || 'Post Media'}
                                fill
                                className="object-contain" // Removed scale class, handled by motion
                                priority
                                unoptimized={post.mediaUrl.includes('picsum')} // Optimization for demo images
                                draggable={false} // Prevent browser native drag
                            />
                            {!isZoomed && (
                                <div className="absolute top-2 left-2 bg-black/40 p-1.5 rounded-full backdrop-blur-sm pointer-events-none">
                                    <ZoomIn className="w-4 h-4 text-white/80" />
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Minimal Info Overlay (Caption) */}
                    {!isZoomed && (
                        <div className="absolute bottom-0 left-0 right-0 p-4 z-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none">
                            <p className="text-white text-sm dir-rtl leading-relaxed line-clamp-3">
                                {post.caption}
                            </p>
                            <div className="text-xs text-white/60 mt-1">
                                {new Date().toLocaleDateString('ar-MA')} {/* Placeholder Date */}
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
