'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ZoomIn } from 'lucide-react'

interface ListingImageGalleryProps {
    images: string[]
    title: string
}

export function ListingImageGallery({ images, title }: ListingImageGalleryProps) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null)

    return (
        <>
            {/* Main Display - Click to Zoom */}
            <div
                className="relative w-full aspect-square bg-zinc-900 overflow-hidden cursor-zoom-in group"
                onClick={() => setSelectedImage(images[0])}
            >
                <Image
                    src={images[0]}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    priority
                />

                {/* Zoom Indicator */}
                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ZoomIn className="w-5 h-5 text-white" />
                </div>
            </div>

            {/* Fullscreen Viewer Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedImage(null)}
                        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 cursor-zoom-out"
                    >
                        {/* Close Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                setSelectedImage(null)
                            }}
                            className="absolute top-6 right-6 z-50 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                        >
                            <X className="w-8 h-8 text-white" />
                        </button>

                        {/* Image Container */}
                        <motion.div
                            layoutId={`image-${selectedImage}`}
                            className="relative w-full h-full max-w-5xl max-h-[85vh] flex items-center justify-center p-6"
                            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image
                        >
                            <div className="relative w-full h-full">
                                <Image
                                    src={selectedImage}
                                    alt={title}
                                    fill
                                    className="object-contain"
                                    quality={100}
                                />
                            </div>
                        </motion.div>

                        {/* Caption / Title */}
                        <div className="absolute bottom-10 left-0 right-0 text-center pointer-events-none">
                            <p className="text-white/80 text-lg font-medium">{title}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
