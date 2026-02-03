'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createListing } from '@/actions/market'
import { toast } from 'sonner'
import { useGeolocation } from '@/hooks/useGeolocation'
import { Button } from '@/ui/Button'
import { Input } from '@/ui/Input'
import { Textarea } from '@/ui/Textarea'

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
        formData.append('lat', coordinates.latitude.toString())
        formData.append('lng', coordinates.longitude.toString())
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
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-zinc-900 border border-purple-500/30 w-full max-w-md rounded-xl p-6 shadow-2xl relative"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 left-4 text-zinc-500 hover:text-white"
                        >
                            ✕ إغلاق
                        </button>

                        <h2 className="text-2xl font-bold mb-2 text-right text-purple-400">
                            📣 اطلب ما تحتاج
                        </h2>
                        <p className="text-zinc-400 text-sm text-right mb-6">
                            سيصل طلبك إلى الباعة المتجولين والمحلات في دائرة 500 متر.
                        </p>

                        <form action={handleSubmit} className="space-y-4 text-right" dir="rtl">
                            <div>
                                <Input
                                    label="ماذا تريد؟"
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
                                <Textarea
                                    label="تفاصيل إضافية"
                                    name="description"
                                    rows={3}
                                    className="focus:border-purple-500"
                                    placeholder="مثلاً: أريد 2 كيلو سردين طري..."
                                />
                            </div>

                            <div className="pt-2">
                                <Button
                                    variant="purple"
                                    disabled={loading || !coordinates}
                                    isLoading={loading}
                                    className="w-full h-12"
                                >
                                    📣 أرسل الطلب للجيران
                                </Button>
                                {!coordinates && (
                                    <p className="text-xs text-red-400 mt-2 text-center">
                                        جاري تحديد موقعك لإرسال الطلب...
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
