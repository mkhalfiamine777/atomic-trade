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
        </ModalWrapper>
    )
}
