'use client'

import { AuthForm } from '@/components/auth/AuthForm'
import { motion } from 'framer-motion'

export default function LoginPage() {
    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Right Side: Visuals */}
            <div className="hidden lg:flex flex-col justify-center items-center bg-zinc-950 relative overflow-hidden p-12">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-zinc-950 to-zinc-950" />
                <div className="relative z-10 text-center space-y-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-6xl font-bold text-white mb-2">👋 مرحباً بعودتك</h1>
                        <p className="text-xl text-zinc-400">
                            تابع تجارتك، تفقّد أرباحك، وسيطر على حيك.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Left Side: Form */}
            <div className="flex flex-col justify-center px-8 lg:px-24 py-12 bg-background">
                <div className="w-full max-w-md mx-auto space-y-8">
                    <div className="space-y-2 text-right">
                        <h2 className="text-3xl font-bold tracking-tight">تسجيل الدخول</h2>
                        <p className="text-muted-foreground">
                            أدخل رقم هاتفك وكلمة المرور للمتابعة
                        </p>
                    </div>

                    <AuthForm mode="login" />
                </div>
            </div>
        </div>
    )
}
