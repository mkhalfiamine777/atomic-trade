'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useLightboxStore } from '@/store/useLightboxStore'

export function VideoLightbox() {
    const { isOpen, activeVideoUrl, layoutId, closeLightbox } = useLightboxStore()
    const videoRef = useRef<HTMLVideoElement>(null)

    // Handle escape key to close
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                closeLightbox()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, closeLightbox])

    return (
        <AnimatePresence>
            {isOpen && activeVideoUrl && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeLightbox}
                        className="absolute inset-0 bg-black/95 backdrop-blur-xl cursor-zoom-out"
                    />

                    {/* Close Button */}
                    <button
                        onClick={closeLightbox}
                        className="absolute top-6 right-6 z-50 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {/* Video Container */}
                    <motion.div
                        layoutId={layoutId || undefined}
                        initial={!layoutId ? { opacity: 0, scale: 0.9 } : undefined}
                        animate={!layoutId ? { opacity: 1, scale: 1 } : undefined}
                        exit={!layoutId ? { opacity: 0, scale: 0.9 } : undefined}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="relative z-10 w-full max-w-[95vw] sm:max-w-[1200px] flex items-center justify-center p-4 outline-none"
                    >
                        <video
                            ref={videoRef}
                            src={activeVideoUrl}
                            controls
                            autoPlay
                            className="max-h-[90vh] w-auto max-w-full object-contain rounded-xl shadow-2xl"
                            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the video itself
                        />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
