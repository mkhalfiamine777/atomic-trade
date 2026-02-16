'use client'

import { useState } from 'react'
import { ModalWrapper } from './ModalWrapper'
import { toast } from 'sonner'
import { createStory } from '@/actions/stories'
import { Input } from '@/components/ui/input'
import { MediaUploader } from '@/components/video/MediaUploader'

interface CreateStoryModalProps {
    isOpen: boolean
    onClose: () => void
    userId: string
    userLat: number
    userLng: number
    onSuccess?: () => void
}

export function CreateStoryModal({
    isOpen,
    onClose,
    userId,
    userLat,
    userLng,
    onSuccess
}: CreateStoryModalProps) {
    const [caption, setCaption] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    const handleUploadComplete = async (url: string, type: 'IMAGE' | 'VIDEO', metadata: any) => {
        setIsSaving(true)
        try {
            // Save to DB via Server Action
            const formData = new FormData()
            formData.append('mediaUrl', url)
            formData.append('mediaType', type)
            formData.append('caption', caption)
            formData.append('userId', userId)
            formData.append('latitude', userLat.toString())
            formData.append('longitude', userLng.toString())

            // Add metadata if needed later (trimming info)
            if (type === 'VIDEO') {
                formData.append('duration', metadata?.duration?.toString() || '0')
            }

            const result = await createStory(formData)

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success('تم نشر قصتك بنجاح! 📹')
                onClose()
                if (onSuccess) onSuccess()
                setCaption('')
            }
        } catch (error) {
            console.error(error)
            toast.error('حدث خطأ أثناء الحفظ')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <ModalWrapper
            isOpen={isOpen}
            onClose={onClose}
            title="إضافة قصة جديدة 📹"
            className="border-zinc-700"
            zIndex={2000}
        >
            <div className="space-y-4">
                {/* Caption Input - Always visible */}
                <div>
                    <label className="block text-sm text-zinc-400 mb-1">وصف القصة (اختياري)</label>
                    <Input
                        value={caption}
                        onChange={e => setCaption(e.target.value)}
                        placeholder="اكتب تعليقاً..."
                        className="bg-zinc-800 border-zinc-700 placeholder-zinc-500 focus:ring-2 focus:ring-indigo-500 mb-4"
                        disabled={isSaving}
                    />
                </div>

                {/* New Media Uploader */}
                <MediaUploader
                    onUploadComplete={handleUploadComplete}
                    disabled={isSaving}
                    className="w-full"
                />
            </div>

            {isSaving && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 rounded-2xl">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
            )}
        </ModalWrapper>
    )
}
