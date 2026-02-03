'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { createStory } from '@/actions/stories'
import { Button } from '@/ui/Button'
import { Input } from '@/ui/Input'
import { useUploadThing } from '@/utils/uploadthing'

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
    const [file, setFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [caption, setCaption] = useState('')
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Uploadthing Hook
    const { startUpload } = useUploadThing("mediaPost", {
        onClientUploadComplete: () => {
            // Handled in handleSubmit manually for better control flow
        },
        onUploadError: (error: Error) => {
            toast.error(`خطأ في الرفع: ${error.message}`);
            setUploading(false);
        },
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.size > 200 * 1024 * 1024) {
                toast.error('الفيديو كبير جداً (الحد الأقصى 200 ميجابايت)')
                return
            }
            setFile(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file) return

        setUploading(true)

        try {
            // 1. Upload to Cloud (Uploadthing)
            const uploadRes = await startUpload([file]);

            if (!uploadRes || uploadRes.length === 0) {
                throw new Error("فشل رفع الملف");
            }

            const mediaUrl = uploadRes[0].url;
            const mediaType = file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE';

            // 2. Save to DB via Server Action
            const formData = new FormData()
            formData.append('mediaUrl', mediaUrl)
            formData.append('mediaType', mediaType)
            formData.append('caption', caption)
            formData.append('userId', userId)
            formData.append('latitude', userLat.toString())
            formData.append('longitude', userLng.toString())

            const result = await createStory(formData)

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success('تم نشر قصتك بنجاح! 📹')
                onClose()
                if (onSuccess) onSuccess()
                setFile(null)
                setPreviewUrl(null)
                setCaption('')
            }
        } catch (error) {
            console.error(error)
            toast.error('حدث خطأ أثناء الرفع')
        } finally {
            setUploading(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
                    >
                        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">إضافة قصة جديدة 📹</h2>
                            <button onClick={onClose} className="text-zinc-400 hover:text-white">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            {!previewUrl ? (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="h-64 border-2 border-dashed border-zinc-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-zinc-800/50 transition-colors"
                                >
                                    <span className="text-4xl mb-2">📸 / 📹</span>
                                    <p className="text-zinc-400">اضغط لرفع صورة أو فيديو</p>
                                    <p className="text-xs text-zinc-500 mt-2">
                                        Images or Video (Max 200MB)
                                    </p>
                                </div>
                            ) : (
                                <div className="relative h-64 bg-black rounded-xl overflow-hidden">
                                    {file?.type.startsWith('video/') ? (
                                        <video
                                            src={previewUrl}
                                            controls
                                            className="w-full h-full object-contain"
                                        />
                                    ) : (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="w-full h-full object-contain"
                                        />
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFile(null)
                                            setPreviewUrl(null)
                                        }}
                                        className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-red-500"
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}

                            <input
                                type="file"
                                accept="video/*,image/*"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                            />

                            <div>
                                <Input
                                    label="وصف القصة (اختياري)"
                                    value={caption}
                                    onChange={e => setCaption(e.target.value)}
                                    placeholder="ماذا يحدث حولك؟"
                                    className="bg-zinc-800 border-zinc-700 placeholder-zinc-500 focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={!file || uploading}
                                isLoading={uploading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 h-auto py-3 rounded-xl"
                            >
                                {uploading ? 'جاري الرفع...' : 'نشر القصة 🚀'}
                            </Button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
