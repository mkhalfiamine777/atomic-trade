'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils' // Assuming a utility for class merging exists, otherwise will use template literals

interface ModalWrapperProps {
    isOpen: boolean
    onClose: () => void
    children: ReactNode
    title?: ReactNode
    className?: string
    zIndex?: number
}

export function ModalWrapper({
    isOpen,
    onClose,
    children,
    title,
    className,
    zIndex = 50
}: ModalWrapperProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    className={`fixed inset-0 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm`}
                    style={{ zIndex }}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                            "bg-zinc-900 border border-white/10 w-full max-w-md rounded-2xl relative shadow-2xl overflow-hidden",
                            className
                        )}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 left-4 text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-800 p-1.5 rounded-full transition-colors z-10"
                        >
                            <X size={20} />
                        </button>

                        {/* Optional Title Header */}
                        {title && (
                            <div className="p-6 pb-2">
                                <h2 className="text-xl font-bold text-white text-right">
                                    {title}
                                </h2>
                            </div>
                        )}

                        {/* Content */}
                        <div className="p-6 pt-2">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
