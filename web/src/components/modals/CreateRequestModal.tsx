'use client'

import { useState } from 'react'
import { ModalWrapper } from './ModalWrapper'
import { createListing } from '@/actions/market'
import { toast } from 'sonner'
import { useGeolocation } from '@/hooks/useGeolocation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface Props {
    isOpen: boolean
    onClose: () => void
}

export function CreateRequestModal({ isOpen, onClose }: Props) {
    const { coordinates } = useGeolocation()
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        if (!coordinates) {
            toast.error('❌ يجب تفعيل الموقع لتصل طلباتك للباعة القريبين!')
            return
        }

        setLoading(true)
        formData.append('lat', coordinates.lat.toString())
        formData.append('lng', coordinates.lng.toString())
        formData.append('type', 'REQUEST') // Important: Set type to REQUEST

        // Server Action
        const result = await createListing(formData)

        setLoading(false)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success('📣 تم إرسال طلبك! سيتلقى الباعة القريبون إشعاراً فوراً.')
            onClose()
        }
    }

    return (
        <ModalWrapper
            isOpen={isOpen}
            onClose={onClose}
            title={<span className="text-purple-400">📣 اطلب ما تحتاج</span>}
            className="border-purple-500/30"
            zIndex={9999}
        >
            <p className="text-zinc-400 text-sm text-right mb-6">
                سيصل طلبك إلى الباعة المتجولين والمحلات في دائرة 500 متر.
            </p>

            <form action={handleSubmit} className="space-y-4 text-right" dir="rtl">
                <div>
                    <label className="block text-sm text-zinc-400 mb-1">ماذا تريد؟</label>
                    <Input
                        name="title"
                        required
                        className="focus:border-purple-500"
                        placeholder="مثلاً: سمك طري، تلفاز مستعمل..."
                    />
                </div>

                <div>
                    <label className="block text-sm text-zinc-400 mb-1">
                        تصنيف الطلب
                    </label>
                    <select
                        name="category"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg h-10 px-3 focus:outline-none focus:border-purple-500 text-zinc-100"
                    >
                        <option value="GROCERY">🛒 مواد غذائية</option>
                        <option value="FASHION">👕 ملابس</option>
                        <option value="ELECTRONICS">📱 إلكترونيات</option>
                        <option value="SERVICES">🔧 خدمات / صيانة</option>
                    </select>
                </div>

                {/* Hidden Price for Requests (Optional offering price) */}
                <input type="hidden" name="price" value="0" />

                <div>
                    <label className="block text-sm text-zinc-400 mb-1">تفاصيل إضافية</label>
                    <Textarea
                        name="description"
                        rows={3}
                        className="focus:border-purple-500"
                        placeholder="مثلاً: أريد 2 كيلو سردين طري..."
                    />
                </div>

                <div className="pt-2">
                    <Button
                        variant="secondary"
                        disabled={loading || !coordinates}
                        className="w-full h-12"
                    >
                        {loading ? '⏳ جاري الإرسال...' : '📣 أرسل الطلب للجيران'}
                    </Button>
                    {!coordinates && (
                        <p className="text-xs text-red-400 mt-2 text-center">
                            جاري تحديد الموقع لإرسال الطلب...
                        </p>
                    )}
                </div>
            </form>
        </ModalWrapper>
    )
}
