'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createListing } from '@/actions/market'
import { toast } from 'sonner'
import { useGeolocation } from '@/hooks/useGeolocation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useMediaUpload } from '@/hooks/useMediaUpload'

interface Props {
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => void
}

export function AddProductModal({ isOpen, onClose, onSuccess }: Props) {
    const { coordinates } = useGeolocation()
    const [loading, setLoading] = useState(false)

    const {
        file,
        startUpload,
        onInputChange
    } = useMediaUpload({
        endpoint: "mediaPost"
    })

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        const form = e.target as HTMLFormElement
        const formData = new FormData(form)

        if (!coordinates) {
            toast.error('❌ يجب تفعيل الموقع (GPS) لإضافة منتج!')
            return
        }

        setLoading(true)

        try {
            let imageUrl = ''

            if (file) {
                const uploadRes = await startUpload()
                if (uploadRes && uploadRes[0]) {
                    imageUrl = uploadRes[0].url
                }
            }

            // Append Location & ImageURL
            formData.append('lat', coordinates.lat.toString())
            formData.append('lng', coordinates.lng.toString())
            if (imageUrl) formData.append('imageUrl', imageUrl)

            // Server Action
            const result = await createListing(formData)

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success('🎉 تم نشر المنتج بنجاح!')
                onClose()
                if (onSuccess) onSuccess()
            }
        } catch (error) {
            console.error(error)
            toast.error('حدث خطأ غير متوقع')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-xl p-6 shadow-2xl relative"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 left-4 text-zinc-500 hover:text-white"
                        >
                            ✕ إغلاق
                        </button>

                        <h2 className="text-2xl font-bold mb-6 text-right">🛒 إضافة منتج جديد</h2>

                        <form onSubmit={handleSubmit} className="space-y-4 text-right" dir="rtl">
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">اسم المنتج</label>
                                <Input
                                    name="title"
                                    required
                                    placeholder="مثلاً: زيت زيتون بكر"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">
                                    صورة المنتج 📸
                                </label>
                                <input
                                    name="file"
                                    type="file"
                                    accept="image/*"
                                    onChange={onInputChange}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm text-zinc-300 file:bg-primary file:text-black file:border-0 file:rounded-md file:px-4 file:py-1 file:ml-4 file:font-bold hover:file:opacity-90 transition-all cursor-pointer"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">السعر (درهم)</label>
                                <Input
                                    name="price"
                                    type="number"
                                    required
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">الوصف</label>
                                <Textarea
                                    name="description"
                                    rows={3}
                                    placeholder="تفاصيل المنتج..."
                                />
                            </div>

                            <div className="pt-2">
                                <Button
                                    disabled={loading || !coordinates}
                                    className="w-full h-12"
                                >
                                    {loading ? '⏳ جاري النشر...' : '🚀 نشر في الحي'}
                                </Button>
                                {!coordinates && (
                                    <p className="text-xs text-red-400 mt-2 text-center">
                                        جاري تحديد الموقع...
                                    </p>
                                )}
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
