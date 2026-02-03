'use client'

import { login } from '@/actions/auth'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { toast } from 'sonner'
import { useEffect } from 'react'

const initialState = {
    error: ''
}

function SubmitButton() {
    const { pending } = useFormStatus()

    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full bg-primary text-primary-foreground h-12 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
            {pending ? 'جاري التحقق...' : 'دخول'}
        </button>
    )
}

export default function LoginPage() {
    const [state, formAction] = useActionState(login, initialState)

    useEffect(() => {
        if (state?.error) {
            toast.error(state.error)
        }
    }, [state])

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

                    <form action={formAction} className="space-y-6 text-right" dir="rtl">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none" htmlFor="phone">
                                رقم الهاتف
                            </label>
                            <input
                                className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                id="phone"
                                name="phone"
                                type="tel"
                                placeholder="0600000000"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label
                                    className="text-sm font-medium leading-none"
                                    htmlFor="password"
                                >
                                    كلمة المرور
                                </label>
                                <Link href="#" className="text-xs text-primary hover:underline">
                                    نسيت كلمة المرور؟
                                </Link>
                            </div>
                            <input
                                className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                id="password"
                                name="password"
                                type="password"
                                required
                            />
                        </div>

                        {state?.error && (
                            <div className="text-red-500 text-sm font-medium text-center">
                                ⚠️ {state.error}
                            </div>
                        )}

                        <SubmitButton />
                    </form>

                    <div className="text-center text-sm text-muted-foreground">
                        ليس لديك حساب؟{' '}
                        <Link href="/signup" className="font-semibold text-primary hover:underline">
                            أنشئ حساباً جديداً
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
