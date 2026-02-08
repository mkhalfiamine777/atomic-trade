'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { VideoPlayer } from './VideoPlayer'
import { VideoActions } from './VideoActions'
import { TabPost } from '../profile/ProfileTabs'

interface VideoModalProps {
    isOpen: boolean
    onClose: () => void
    post: TabPost | null
}

export function VideoModal({ isOpen, onClose, post }: VideoModalProps) {
    if (!isOpen || !post) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[1000] bg-black text-white flex items-center justify-center p-0 md:p-4"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 bg-black/50 p-2 rounded-full hover:bg-white/20 transition-colors"
                >
                    <X className="w-6 h-6 text-white" />
                </button>

                {/* Video Container */}
                <div className="relative w-full h-full md:max-w-[400px] md:aspect-[9/16] bg-black overflow-hidden rounded-xl shadow-2xl">
                    <VideoPlayer
                        src={post.mediaUrl}
                        isActive={true}
                    />

                    {/* Minimal Actions Overlay for Profile View */}
                    <div className="absolute top-0 right-0 bottom-0 pointer-events-none p-4 flex flex-col justify-end items-end z-20">
                        {/* 
                            We can inject simplified actions here if needed, 
                            or reuse VideoActions fully if we pass all props.
                            For now, let's keep it clean to just VIEW the video.
                        */}
                    </div>

                    {/* Caption Overlay */}
                    <div className="absolute bottom-0 left-0 right-16 p-4 z-20 bg-gradient-to-t from-black/80 to-transparent">
                        <p className="text-white text-sm dir-rtl">{post.caption}</p>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
