'use client'

import { AuthForm } from '@/components/auth/AuthForm'
import { motion } from 'framer-motion'

export default function SignupPage() {
    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Right Side: Visuals */}
            <div className="hidden lg:flex flex-col justify-center items-center bg-zinc-900 relative overflow-hidden p-12">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20" />
                <div className="relative z-10 text-center space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                            SouqMap
                        </h1>
                        <p className="mt-4 text-xl text-zinc-400">
                            أول منصة تجارة اجتماعية تعتمد على موقعك.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-2 gap-4 mt-12 max-w-md mx-auto">
                        <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50 backdrop-blur-sm">
                            <div className="text-3xl mb-2">📍</div>
                            <div className="text-sm font-medium">تنبيهات جغرافية</div>
                        </div>
                        <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50 backdrop-blur-sm">
                            <div className="text-3xl mb-2">💰</div>
                            <div className="text-sm font-medium">بيع مباشر</div>
                        </div>
                        <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50 backdrop-blur-sm">
                            <div className="text-3xl mb-2">👑</div>
                            <div className="text-sm font-medium">سيطر على الحي</div>
                        </div>
                        <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50 backdrop-blur-sm">
                            <div className="text-3xl mb-2">🚀</div>
                            <div className="text-sm font-medium">نمو سريع</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Left Side: Form */}
            <div className="flex flex-col justify-center px-8 lg:px-24 py-12 bg-background">
                <div className="w-full max-w-md mx-auto space-y-8">
                    <div className="space-y-2 text-right">
                        <h2 className="text-3xl font-bold tracking-tight">إنشاء حساب جديد</h2>
                        <p className="text-muted-foreground">أدخل بياناتك للانضمام إلى مجتمعنا</p>
                    </div>

                    <AuthForm mode="signup" />
                </div>
            </div>
        </div>
    )
}
