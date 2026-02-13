'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

import { Story } from "@/types"

interface StoryViewerProps {
    isOpen: boolean
    onClose: () => void
    story: Story | null
}

export function StoryViewer({ isOpen, onClose, story }: StoryViewerProps) {
    if (!story) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[2000] bg-black/95 flex items-center justify-center p-4 backdrop-blur-xl"
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white hover:text-red-500 z-[2010] p-2 bg-black/50 rounded-full transition-colors"
                    >
                        <X size={32} />
                    </button>

                    <div className="relative w-full max-w-lg aspect-[9/16] max-h-[90vh] flex flex-col justify-center">
                        {/* Story Header */}
                        <div className="absolute top-4 left-4 z-10 flex items-center gap-3 w-full">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold border-2 border-white shadow-lg">
                                {story.user?.name?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-white font-bold drop-shadow-md text-lg">
                                    {story.user?.name || 'Unknown'}
                                </h3>
                                <p className="text-xs text-white/80 drop-shadow-md">
                                    {new Date(story.createdAt).toLocaleTimeString()} ⌚
                                </p>
                            </div>
                        </div>

                        {/* Media Player */}
                        {story.mediaType === 'VIDEO' ? (
                            <video
                                src={story.mediaUrl}
                                controls
                                autoPlay
                                className="w-full h-full object-contain rounded-xl shadow-2xl bg-black"
                            />
                        ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={story.mediaUrl}
                                alt="Story"
                                className="w-full h-full object-contain rounded-xl shadow-2xl bg-black"
                            />
                        )}

                        {/* Caption Overlay */}
                        {story.caption && (
                            <div className="absolute bottom-16 left-0 right-0 p-4 text-center z-10">
                                <p className="text-white text-lg font-medium bg-black/60 inline-block px-6 py-3 rounded-full backdrop-blur-md shadow-lg border border-white/10">
                                    {story.caption}
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
