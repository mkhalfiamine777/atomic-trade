'use client'

import { useState } from 'react'
import { ModalWrapper } from './ModalWrapper'
import { createListing } from '@/actions/market'
import { toast } from 'sonner'
import { useGeolocation } from '@/hooks/useGeolocation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useMediaUpload } from '@/hooks/useMediaUpload'
import { CascadingProductSelect } from '@/components/ui/CascadingProductSelect'
import { X } from 'lucide-react'

interface Props {
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => void
}

export function AddProductModal({ isOpen, onClose, onSuccess }: Props) {
    const { coordinates } = useGeolocation()
    const [loading, setLoading] = useState(false)

    const {
        files,
        previewUrls,
        removeFile,
        startUpload,
        onInputChange
    } = useMediaUpload({
        endpoint: "productImages",
        maxFiles: 4
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

            if (files.length > 0) {
                const uploadRes = await startUpload()
                console.log("🟢 [DEBUG] Raw UploadThing Response:", uploadRes)
                if (uploadRes && uploadRes.length > 0) {
                    // Combine all uploaded URLs separated by commas
                    imageUrl = uploadRes.map(res => res.url).join(',')
                }
            }

            // Append Location & ImageURL
            formData.append('lat', coordinates.lat.toString())
            formData.append('lng', coordinates.lng.toString())
            if (imageUrl) formData.append('imageUrl', imageUrl)

            console.log("Submitting formData with imageUrls:", imageUrl)

            // Server Action
            const result = await createListing(formData)

            console.log("Action result:", result)

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
        <ModalWrapper
            isOpen={isOpen}
            onClose={onClose}
            title="🛒 إضافة منتج جديد"
            className="border-zinc-800"
            zIndex={9999}
        >
            <form onSubmit={handleSubmit} className="space-y-4 text-right" dir="rtl">
                <CascadingProductSelect />

                <div className="pt-2">
                    <label className="block text-sm text-zinc-400 mb-1">تفاصيل إضافية (مطلوبة)</label>
                    <Input
                        name="title"
                        required
                        placeholder="مثلاً: آيفون 15 بروماكس 256GB أزرق"
                        className="focus-visible:ring-emerald-500"
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
                        multiple
                        onChange={onInputChange}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm text-zinc-300 file:bg-primary file:text-black file:border-0 file:rounded-md file:px-4 file:py-1 file:ml-4 file:font-bold hover:file:opacity-90 transition-all cursor-pointer"
                    />
                    {previewUrls.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 mt-2">
                            {previewUrls.map((url, idx) => (
                                <div key={url} className="relative aspect-square rounded-md overflow-hidden border border-zinc-800 group">
                                    <img src={url} alt={`preview ${idx}`} className="object-cover w-full h-full" />
                                    <button
                                        type="button"
                                        onClick={() => removeFile(idx)}
                                        className="absolute top-1 right-1 bg-black/60 hover:bg-red-500/90 p-1 rounded-full backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <X className="w-3 h-3 text-white" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
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
        </ModalWrapper>
    )
}
