'use client'

import { useState } from 'react'
import { createPost } from '@/actions/social'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function CreatePostButton({ userId }: { userId: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [mediaUrl, setMediaUrl] = useState('')
    const [caption, setCaption] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!mediaUrl) return

        setIsSubmitting(true)
        const result = await createPost(userId, caption, mediaUrl)

        if (result.success) {
            toast.success('تم نشر المنشور بنجاح! 🎉')
            setIsOpen(false)
            setMediaUrl('')
            setCaption('')
            router.refresh()
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
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-24 left-6 z-50 bg-gx-primary hover:bg-pink-600 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-2xl transition-transform hover:scale-110 border-2 border-white/20"
                title="منشور جديد"
            >
                ➕
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-gx-card border border-white/10 w-full max-w-md rounded-2xl p-6 relative shadow-2xl animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 left-4 text-zinc-400 hover:text-white"
                        >
                            ✕
                        </button>

                        <h2 className="text-xl font-bold text-white mb-6 text-right">
                            منشور جديد 📸
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Image Preview / Input */}
                            <div className="space-y-2">
                                <label className="text-sm text-zinc-400 block text-right">
                                    رابط الصورة (أو اختر من الأسفل)
                                </label>
                                <input
                                    type="text"
                                    placeholder="https://example.com/image.jpg"
                                    value={mediaUrl}
                                    onChange={e => setMediaUrl(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-gx-primary outline-none text-right placeholder-zinc-600"
                                />

                                <div className="flex gap-2 justify-end mt-2">
                                    {presets.map((url, i) => (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            key={i}
                                            src={url}
                                            alt={`Preset ${i + 1}`}
                                            onClick={() => setMediaUrl(url)}
                                            className={`w-12 h-12 rounded-md object-cover cursor-pointer hover:opacity-80 border-2 ${mediaUrl === url ? 'border-gx-primary' : 'border-transparent'}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Caption */}
                            <div className="space-y-2">
                                <label className="text-sm text-zinc-400 block text-right">
                                    الوصف
                                </label>
                                <textarea
                                    placeholder="اكتب شيئاً جميلاً..."
                                    value={caption}
                                    onChange={e => setCaption(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-gx-primary outline-none text-right h-24 placeholder-zinc-600 resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-gx-primary hover:bg-pink-600 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                            >
                                {isSubmitting ? 'جاري النشر...' : 'نشر 🚀'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
