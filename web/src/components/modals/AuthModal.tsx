'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AuthForm } from '@/components/auth/AuthForm'
import { X } from 'lucide-react'
import { useState } from 'react'

interface AuthModalProps {
    isOpen: boolean
    onClose: () => void
    initialMode?: 'login' | 'signup'
}

export function AuthModal({ isOpen, onClose, initialMode = 'signup' }: AuthModalProps) {
    const [mode, setMode] = useState<'login' | 'signup'>(initialMode)

    // Reset mode when modal opens/closes or initialMode changes
    // actually, better to just let the user toggle inside. 
    // But if parent passes a specific prop, we might want to sync.
    // simpler: just use state.

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-black/40 backdrop-blur-xl border border-purple-500/30 w-full max-w-lg rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.15)] overflow-hidden relative flex flex-col max-h-[90vh] text-white"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header Image / Branding (Neon Line) */}
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent shadow-[0_0_10px_rgba(168,85,247,0.5)]" />

                        <button
                            onClick={onClose}
                            className="absolute top-4 left-4 p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 z-10"
                        >
                            <X size={20} />
                        </button>

                        <div className="p-8 overflow-y-auto custom-scrollbar">
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-black tracking-tight text-white mb-2 drop-shadow-md">
                                    {mode === 'login' ? 'مرحباً بعودتك! 👋' : 'انضم إلينا اليوم 🚀'}
                                </h2>
                                <p className="text-zinc-200 text-sm drop-shadow-sm">
                                    {mode === 'login'
                                        ? 'سجل دخولك لمتابعة محادثاتك وتجارتك'
                                        : 'كن جزءاً من مجتمع التجارة الاجتماعية الأول في الحي'}
                                </p>
                            </div>

                            <AuthForm mode={mode} />

                            <div className="mt-6 pt-6 border-t border-white/10 text-center">
                                <p className="text-sm text-zinc-300">
                                    {mode === 'login' ? 'ليس لديك حساب بعد؟' : 'لديك حساب بالفعل؟'}
                                    <button
                                        onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                                        className="mr-2 font-bold text-purple-400 hover:text-purple-300 hover:underline transition-colors"
                                    >
                                        {mode === 'login' ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
                                    </button>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
