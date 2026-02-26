'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, X, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react'
import { submitReview } from '@/actions/trust'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface RatingModalProps {
    isOpen: boolean
    onClose: () => void
    targetUserId: string
    targetUserName: string
    listingId: string
    listingTitle: string
}

export function RatingModal({
    isOpen,
    onClose,
    targetUserId,
    targetUserName,
    listingId,
    listingTitle
}: RatingModalProps) {
    const [rating, setRating] = useState(0)
    const [hoveredRating, setHoveredRating] = useState(0)
    const [comment, setComment] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const router = useRouter()

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error("يرجى اختيار التقييم أولاً (من 1 إلى 5 نجوم)")
            return
        }

        setIsSubmitting(true)
        try {
            const res = await submitReview(targetUserId, listingId, rating, comment)
            if (res.success) {
                setIsSuccess(true)
                toast.success("تم تسجيل التقييم! شكراً لمساهمتك في زيادة الموثوقية.")
                setTimeout(() => {
                    onClose()
                    router.refresh()
                }, 2000)
            } else {
                toast.error(res.error || "حدث خطأ غير متوقع")
            }
        } catch (e) {
            console.error(e)
            toast.error("حدث خطأ في الاتصال بالخادم")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={isSubmitting ? undefined : onClose}
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl overflow-hidden"
                    >
                        {!isSuccess ? (
                            <>
                                {/* Header */}
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-2 text-indigo-400">
                                        <ShieldCheck className="w-5 h-5" />
                                        <h3 className="text-xl font-bold text-white">تقييم الموثوقية</h3>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        disabled={isSubmitting}
                                        className="p-2 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-full transition-colors disabled:opacity-50"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {/* Info text */}
                                    <div className="text-center space-y-2">
                                        <p className="text-zinc-300">
                                            كيف كانت تجربتك مع <strong>{targetUserName}</strong> حول
                                        </p>
                                        <p className="text-sm font-medium text-zinc-100 bg-zinc-800 py-2 px-4 rounded-xl border border-zinc-700/50 inline-block">
                                            {listingTitle}
                                        </p>
                                    </div>

                                    {/* Star Rating Section */}
                                    <div className="flex justify-center items-center gap-2 py-4">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setRating(star)}
                                                onMouseEnter={() => setHoveredRating(star)}
                                                onMouseLeave={() => setHoveredRating(0)}
                                                className="p-1 transition-transform hover:scale-110 active:scale-95"
                                                disabled={isSubmitting}
                                            >
                                                <Star
                                                    className={`w-10 h-10 transition-colors ${(hoveredRating || rating) >= star
                                                            ? 'fill-amber-400 text-amber-400'
                                                            : 'text-zinc-700'
                                                        }`}
                                                />
                                            </button>
                                        ))}
                                    </div>

                                    <div className="text-center text-xs text-zinc-500 font-medium">
                                        نقاط السمعة المحتسبة ستتأثر إيجاباً أو سلباً بصورة تلقائية
                                    </div>

                                    {/* Feedback text area */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-400">تعليق (اختياري)</label>
                                        <textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            placeholder="اكتب تفاصيل تجربتك لتفيد الآخرين..."
                                            className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-indigo-500 rounded-xl p-4 text-white text-sm focus:ring-1 focus:ring-indigo-500 transition-colors h-24 resize-none"
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting || rating === 0}
                                        className="w-full h-12 flex items-center justify-center gap-2 bg-gradient-to-l from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                                        dir="rtl"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                جاري تسجيل التقييم...
                                            </>
                                        ) : (
                                            'تأكيد التقييم'
                                        )}
                                    </button>
                                </div>
                            </>
                        ) : (
                            // Success State
                            <div className="py-10 flex flex-col items-center justify-center text-center space-y-4">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", bounce: 0.5 }}
                                    className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-4"
                                >
                                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                                </motion.div>
                                <h3 className="text-2xl font-bold text-white">شكراً لك!</h3>
                                <p className="text-zinc-400">تم تسجيل تقييمك والتعليق بنجاح في نظام السمعة الذكي.</p>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
