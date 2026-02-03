'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createListing } from '@/actions/market'
import { toast } from 'sonner'
import { useGeolocation } from '@/hooks/useGeolocation'
import { Button } from '@/ui/Button'
import { Input } from '@/ui/Input'
import { Textarea } from '@/ui/Textarea'
import { useUploadThing } from '@/utils/uploadthing'

interface Props {
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => void
}

export function AddProductModal({ isOpen, onClose, onSuccess }: Props) {
    const { coordinates } = useGeolocation()
    const [loading, setLoading] = useState(false)
    const [file, setFile] = useState<File | null>(null) // Track file locally

    // Uploadthing Hook
    const { startUpload } = useUploadThing("mediaPost", {
        onClientUploadComplete: () => { },
        onUploadError: (error: Error) => {
            toast.error(`خطأ في الرفع: ${error.message}`);
            setLoading(false);
        },
    });

    async function handleSubmit(e: React.FormEvent) { // Changed to manual handling
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

            // Upload Image if selected
            const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement
            const file = fileInput?.files?.[0]

            if (file) {
                const uploadRes = await startUpload([file]);
                if (uploadRes && uploadRes[0]) {
                    imageUrl = uploadRes[0].url
                }
            }

            // Append Location & ImageURL
            formData.append('lat', coordinates.latitude.toString())
            formData.append('lng', coordinates.longitude.toString())
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
                                <Input
                                    label="اسم المنتج"
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
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm text-zinc-300 file:bg-primary file:text-black file:border-0 file:rounded-md file:px-4 file:py-1 file:ml-4 file:font-bold hover:file:opacity-90 transition-all cursor-pointer"
                                />
                            </div>

                            <div>
                                <Input
                                    label="السعر (درهم)"
                                    name="price"
                                    type="number"
                                    required
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <Textarea
                                    label="الوصف"
                                    name="description"
                                    rows={3}
                                    placeholder="تفاصيل المنتج..."
                                />
                            </div>

                            <div className="pt-2">
                                <Button
                                    disabled={loading || !coordinates}
                                    isLoading={loading}
                                    className="w-full h-12"
                                >
                                    🚀 نشر في الحي
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
