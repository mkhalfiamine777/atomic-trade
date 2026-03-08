'use client'

import { useState, useEffect } from 'react'
import { createPost } from '@/actions/social'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { ModalWrapper } from './ModalWrapper'
import { useGeolocation } from '@/hooks/useGeolocation'
import { MediaUploader } from '@/components/video/MediaUploader'

interface CreatePostModalProps {
    isOpen: boolean
    onClose: () => void
    userId: string
    onSuccess?: () => void
}

export function CreatePostModal({ isOpen, onClose, userId, onSuccess }: CreatePostModalProps) {
    const [caption, setCaption] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()

    // Unified Geolocation Hook
    const { coordinates, loading, error } = useGeolocation()

    // Reset state when closed
    useEffect(() => {
        if (!isOpen) {
            setCaption('')
            setIsSubmitting(false)
        }
    }, [isOpen])

    const handleUploadComplete = async (url: string, type: 'IMAGE' | 'VIDEO', metadata: any) => {
        if (!coordinates) {
            toast.warning('يرجى انتظار تحديد الموقع لإضافة المنشور للخريطة ⏳')
            return
        }

        setIsSubmitting(true)

        try {
            // Pass location to server action. Dynamic type based on upload.
            const result = await createPost(
                caption,
                url,
                'POST',
                type,
                coordinates.lat,
                coordinates.lng
            )

            if (result.success) {
                toast.success('تم نشر المنشور بنجاح! 🎉')
                onClose()
                router.refresh()
                if (onSuccess) onSuccess()
            } else {
                toast.error('حدث خطأ أثناء النشر')
            }
        } catch (error) {
            console.error(error)
            toast.error('حدث خطأ غير متوقع أثناء النشر')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <ModalWrapper
            isOpen={isOpen}
            onClose={onClose}
            title="منشور اجتماعي 💬"
        >
            <div className="flex justify-between items-center mb-6 -mt-2">
                <div className="text-xs flex items-center gap-1 font-mono">
                    {loading && <span className="text-yellow-400 animate-pulse">جاري تحديد الموقع... 📍</span>}
                    {coordinates && <span className="text-green-400">تم تحديد الموقع ✅</span>}
                    {error && <span className="text-red-400">موقع غير معروف ❌</span>}
                </div>
            </div>

            <div className="space-y-4">
                {/* Caption Input */}
                <div className="space-y-2">
                    <label className="text-sm text-zinc-400 block text-right font-medium">
                        الوصف (اختياري)
                    </label>
                    <textarea
                        placeholder="شارك لحظاتك مع المجتمع..."
                        value={caption}
                        onChange={e => setCaption(e.target.value)}
                        disabled={isSubmitting || !coordinates}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-purple-500 outline-none text-right h-24 placeholder-zinc-700 resize-none dir-rtl disabled:opacity-50"
                    />
                </div>

                {/* Smart Media Uploader */}
                <div className="space-y-2">
                    <label className="text-sm text-zinc-400 block text-right font-medium mb-2">
                        المرفقات (صورة أو فيديو)
                    </label>
                    {coordinates ? (
                        <MediaUploader
                            onUploadComplete={handleUploadComplete}
                            disabled={isSubmitting}
                            className="w-full"
                        />
                    ) : (
                        <div className="w-full h-32 flex items-center justify-center border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-900/50 text-zinc-500 text-sm">
                            يرجى السماح بتحديد الموقع أولاً...
                        </div>
                    )}
                </div>
            </div>

            {isSubmitting && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 rounded-2xl backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
                        <span className="text-purple-400 font-bold shrink-0 animate-pulse">
                            جاري النشر على الخريطة...
                        </span>
                    </div>
                </div>
            )}
        </ModalWrapper>
    )
}
