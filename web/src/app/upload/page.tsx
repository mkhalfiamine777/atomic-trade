'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Camera, MapPin, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MediaUploader } from '@/components/video/MediaUploader'
import { createVideoPost } from '@/actions/createVideo'

export default function UploadPage() {
    const router = useRouter()
    const [caption, setCaption] = useState('')
    const [location, setLocation] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [mediaUrl, setMediaUrl] = useState<string | null>(null)

    // Placeholder user ID (replace when Auth is active)
    const userId = '1'

    const handleUploadComplete = (url: string, type: 'IMAGE' | 'VIDEO') => {
        if (type !== 'VIDEO') {
            toast.error('يرجى رفع فيديو فقط لهذه الصفحة')
            return
        }
        setMediaUrl(url)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!mediaUrl) {
            toast.error('يرجى رفع فيديو أولاً')
            return
        }

        setIsSaving(true)
        try {
            const formData = new FormData()
            // userId handled by server action via cookies
            formData.append('videoUrl', mediaUrl)
            formData.append('description', caption) // Server expects 'description' mapped to caption
            formData.append('location', location)

            const result = await createVideoPost(formData)

            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success('تم نشر الفيديو بنجاح! 🚀')
                router.push('/feed') // Redirect to feed
            }
        } catch (error) {
            console.error(error)
            toast.error('حدث خطأ غير متوقع')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="min-h-screen bg-black text-white pb-20">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800 p-4 flex items-center justify-between">
                <button onClick={() => router.back()} className="p-2 hover:bg-zinc-800 rounded-full">
                    <X className="w-6 h-6" />
                </button>
                <h1 className="text-lg font-bold">إنشاء فيديو جديد</h1>
                <div className="w-10"></div> {/* Spacer */}
            </header>

            <main className="max-w-md mx-auto p-4 space-y-6">

                {/* Upload Section */}
                <section>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">الفيديو</label>
                    {!mediaUrl ? (
                        <MediaUploader
                            onUploadComplete={handleUploadComplete}
                            disabled={isSaving}
                            maxSize={250} // 250MB
                        />
                    ) : (
                        <div className="relative rounded-xl overflow-hidden border border-zinc-700 aspect-[9/16] bg-zinc-900">
                            <video src={mediaUrl} className="w-full h-full object-cover" controls />
                            <button
                                onClick={() => setMediaUrl(null)}
                                className="absolute top-2 right-2 bg-black/60 p-2 rounded-full hover:bg-red-500 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </section>

                {/* Details Form */}
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Caption */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">الوصف</label>
                        <Textarea
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            placeholder="اكتب وصفاً جذاباً للفيديو... #هاشتاق"
                            className="bg-zinc-900 border-zinc-800 focus:ring-indigo-500 min-h-[100px]"
                        />
                    </div>

                    {/* Location (Optional) */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">الموقع (اختياري)</label>
                        <div className="relative">
                            <MapPin className="absolute right-3 top-3 w-5 h-5 text-zinc-500" />
                            <Input
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="أضف موقعاً..."
                                className="bg-zinc-900 border-zinc-800 pr-10 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        disabled={!mediaUrl || isSaving}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 py-4 text-lg font-bold"
                    >
                        {isSaving ? 'جاري النشر...' : 'نشر الفيديو ✨'}
                    </Button>

                </form>
            </main>
        </div>
    )
}
