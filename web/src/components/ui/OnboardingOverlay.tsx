'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Map, Play, ShieldCheck, ChevronLeft, Check } from 'lucide-react'
import { completeOnboarding } from '@/actions/user'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface OnboardingOverlayProps {
    onClose: () => void
}

const steps = [
    {
        id: 1,
        title: 'الخريطة الحية',
        description: 'مرحباً بك في الخريطة الحية لتجارة المحلية و العالمية.',
        icon: <Map className="w-16 h-16 text-emerald-400 mb-4 animate-pulse-slow" />,
        color: 'from-emerald-500/20 to-cyan-500/20',
        borderColor: 'border-emerald-500/30'
    },
    {
        id: 2,
        title: 'استكشف',
        description: 'اكتشف الفيديوهات و النشرات والمزادات للمبيعات و المشتريات.',
        icon: <Play className="w-16 h-16 text-purple-400 mb-4 animate-pulse-slow" />,
        color: 'from-purple-500/20 to-pink-500/20',
        borderColor: 'border-purple-500/30'
    },
    {
        id: 3,
        title: 'بناء الثقة',
        description: 'ابنِ سمعتك المحلية و العالمية للتجاريتك نحو الغنى.',
        icon: <ShieldCheck className="w-16 h-16 text-amber-400 mb-4 animate-pulse-slow" />,
        color: 'from-amber-500/20 to-yellow-500/20',
        borderColor: 'border-amber-500/30'
    }
]

export function OnboardingOverlay({ onClose }: OnboardingOverlayProps) {
    const [currentStep, setCurrentStep] = useState(0)
    const [isSaving, setIsSaving] = useState(false)

    const handleNext = async () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1)
        } else {
            // Finish - Request GPS Before Leaving
            setIsSaving(true)

            if (!navigator.geolocation) {
                toast.error('عذراً، متصفحك لا يدعم تحديد الموقع.')
                setIsSaving(false)
                return
            }

            toast.info('جاري تحديد موقعك لإنهاء التسجيل...', { duration: 3000 })

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords
                    const result = await completeOnboarding(latitude, longitude)
                    if (result.success) {
                        toast.success('تم تحديد الموقع والتسجيل بنجاح! 🚀')
                        onClose()
                    } else {
                        toast.error('حدث خطأ أثناء حفظ تقدمك')
                        setIsSaving(false)
                    }
                },
                (error) => {
                    // User denied or error
                    toast.error('⚠️ لا يمكن بدء العمل حتى توافق على مشاركة موقعك للظهور للمتسوقين!')
                    setIsSaving(false)
                },
                { enableHighAccuracy: true, timeout: 15000 }
            )
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-lg px-4">
            <div className="w-full max-w-sm">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -20, scale: 0.95 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className={cn(
                            "relative bg-black/50 border rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl overflow-hidden",
                            steps[currentStep].borderColor
                        )}
                    >
                        {/* Background Glow */}
                        <div className={cn(
                            "absolute inset-0 bg-gradient-to-br opacity-30 pointer-events-none",
                            steps[currentStep].color
                        )} />

                        <div className="relative z-10 w-full flex flex-col items-center">
                            {steps[currentStep].icon}
                            
                            <h2 className="text-2xl font-black text-white mb-3">
                                {steps[currentStep].title}
                            </h2>
                            
                            <p className="text-zinc-300 text-sm leading-relaxed font-medium mb-8">
                                {steps[currentStep].description}
                            </p>

                            {/* Dots */}
                            <div className="flex items-center gap-2 mb-8 select-none" dir="ltr">
                                {steps.map((s, index) => (
                                    <div
                                        key={s.id}
                                        className={cn(
                                            "h-1.5 rounded-full transition-all duration-300",
                                            index === currentStep ? "w-6 bg-white" : "w-1.5 bg-white/20"
                                        )}
                                    />
                                ))}
                            </div>

                            {/* Button */}
                            <button
                                onClick={handleNext}
                                disabled={isSaving}
                                className="w-full flex items-center justify-center gap-2 bg-white text-black font-bold py-3.5 rounded-2xl hover:bg-zinc-200 active:scale-95 transition-all outline-none"
                            >
                                {isSaving ? (
                                    <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                ) : currentStep === steps.length - 1 ? (
                                    <>
                                        لنبدأ
                                        <Check size={18} strokeWidth={3} />
                                    </>
                                ) : (
                                    <>
                                        التالي
                                        <ChevronLeft size={18} strokeWidth={3} />
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}
