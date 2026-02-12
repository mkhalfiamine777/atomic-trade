'use client'

import { useState, useEffect } from 'react'
import { createPost } from '@/actions/social'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

interface CreatePostModalProps {
    isOpen: boolean
    onClose: () => void
    userId: string
    onSuccess?: () => void
}

export function CreatePostModal({ isOpen, onClose, userId, onSuccess }: CreatePostModalProps) {
    const [mediaUrl, setMediaUrl] = useState('')
    const [caption, setCaption] = useState('')
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
    const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()

    // Get location when modal opens
    useEffect(() => {
        if (isOpen) {
            if (navigator.geolocation) {
                setLocationStatus('loading')
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        setLocation({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        })
                        setLocationStatus('success')
                    },
                    (error) => {
                        console.error('Error getting location:', error)
                        setLocationStatus('error')
                        toast.error('تعذر تحديد موقعك 📍')
                    }
                )
            } else {
                setLocationStatus('error')
                toast.error('المتصفح لا يدعم تحديد الموقع')
            }
        } else {
            // Reset state when closed
            setMediaUrl('')
            setCaption('')
            setLocationStatus('idle')
        }
    }, [isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!mediaUrl) return

        if (locationStatus !== 'success') {
            toast.warning('يرجى انتظار تحديد الموقع لإضافة المنشور للخريطة ⏳')
            return
        }

        setIsSubmitting(true)

        // Pass location to server action
        const result = await createPost(
            userId,
            caption,
            mediaUrl,
            'POST',
            location?.lat,
            location?.lng
        )

        if (result.success) {
            toast.success('تم نشر المنشور بنجاح! 🎉')
            onClose()
            router.refresh()
            if (onSuccess) onSuccess()
        } else {
            toast.error('حدث خطأ أثناء النشر')
        }
        setIsSubmitting(false)
    }

    // Preset images for quick testing (MVP)
    const presets = [
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop', // Phone
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop', // Watch
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop' // Headphones
    ]

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-zinc-900 border border-white/10 w-full max-w-md rounded-2xl p-6 relative shadow-2xl"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 left-4 text-zinc-400 hover:text-white bg-zinc-800 p-1 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex justify-between items-center mb-6 mt-2">
                            <div className="text-xs flex items-center gap-1 font-mono">
                                {locationStatus === 'loading' && <span className="text-yellow-400 animate-pulse">جاري تحديد الموقع... 📍</span>}
                                {locationStatus === 'success' && <span className="text-green-400">تم تحديد الموقع ✅</span>}
                                {locationStatus === 'error' && <span className="text-red-400">موقع غير معروف ❌</span>}
                            </div>
                            <h2 className="text-xl font-bold text-white text-right">
                                منشور اجتماعي 💬
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Image Preview / Input */}
                            <div className="space-y-2">
                                <label className="text-sm text-zinc-400 block text-right font-medium">
                                    صورة المنشور
                                </label>
                                <input
                                    type="text"
                                    placeholder="https://example.com/image.jpg"
                                    value={mediaUrl}
                                    onChange={e => setMediaUrl(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-purple-500 outline-none text-right placeholder-zinc-700 dir-ltr"
                                />

                                <div className="flex gap-2 justify-end mt-2 overflow-x-auto pb-2">
                                    {presets.map((url, i) => (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            key={i}
                                            src={url}
                                            alt={`Preset ${i + 1}`}
                                            onClick={() => setMediaUrl(url)}
                                            className={`w-16 h-16 rounded-md object-cover cursor-pointer hover:opacity-80 border-2 transition-all ${mediaUrl === url ? 'border-purple-500 scale-105' : 'border-transparent'}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Caption */}
                            <div className="space-y-2">
                                <label className="text-sm text-zinc-400 block text-right font-medium">
                                    الوصف
                                </label>
                                <textarea
                                    placeholder="شارك لحظاتك مع المجتمع..."
                                    value={caption}
                                    onChange={e => setCaption(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-purple-500 outline-none text-right h-24 placeholder-zinc-700 resize-none dir-rtl"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || locationStatus !== 'success'}
                                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-lg shadow-purple-900/20"
                            >
                                {isSubmitting ? 'جاري النشر...' : 'نشر على الخريطة 🗺️'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
