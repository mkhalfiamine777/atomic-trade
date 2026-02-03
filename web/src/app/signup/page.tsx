'use client'

import { signup } from '@/actions/auth'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { motion } from 'framer-motion'
import { useState } from 'react'
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
            {pending ? 'جاري الإنشاء...' : 'إنشاء حساب جديد'}
        </button>
    )
}

export default function SignupPage() {
    const [accountType, setAccountType] = useState('INDIVIDUAL')
    const [state, formAction] = useActionState(signup, initialState)

    useEffect(() => {
        if (state?.error) {
            toast.error(state.error)
        }
    }, [state])

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

                    <form action={formAction} className="space-y-6 text-right" dir="rtl">
                        {/* Account Type Toggle */}
                        <div className="flex bg-zinc-800 p-1 rounded-lg mb-6">
                            <button
                                type="button"
                                onClick={() => setAccountType('INDIVIDUAL')}
                                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${accountType === 'INDIVIDUAL' ? 'bg-primary text-white shadow' : 'text-zinc-400 hover:text-white'}`}
                            >
                                👤 مستخدم عادي
                            </button>
                            <button
                                type="button"
                                onClick={() => setAccountType('SHOP')}
                                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${accountType === 'SHOP' ? 'bg-primary text-white shadow' : 'text-zinc-400 hover:text-white'}`}
                            >
                                🏪 تاجر / محل
                            </button>
                        </div>
                        <input type="hidden" name="type" value={accountType} />

                        <div className="space-y-2">
                            <label
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                htmlFor="name"
                            >
                                {accountType === 'SHOP' ? 'اسم المتجر التجاري' : 'الاسم الكامل'}
                            </label>
                            <input
                                className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                id="name"
                                name="name"
                                placeholder={
                                    accountType === 'SHOP'
                                        ? 'مثلاً: بقالة الأمانة'
                                        : 'مثلاً: محمد عبده'
                                }
                                required
                            />
                        </div>

                        {accountType === 'SHOP' && (
                            <div className="space-y-2">
                                <label
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    htmlFor="shopCategory"
                                >
                                    نوع النشاط
                                </label>
                                <select
                                    className="flex h-12 w-full rounded-md border border-input bg-zinc-950 px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    id="shopCategory"
                                    name="shopCategory"
                                >
                                    <option value="GROCERY">🛒 مواد غذائية (Hanout)</option>
                                    <option value="FASHION">👕 ملابس وأزياء</option>
                                    <option value="ELECTRONICS">📱 إلكترونيـات</option>
                                    <option value="SERVICES">🔧 خدمات / حرف</option>
                                    <option value="FOOD">🍔 مطعم / مقهى</option>
                                    <option value="OTHER">📦 أخرى</option>
                                </select>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                htmlFor="phone"
                            >
                                رقم الهاتف
                            </label>
                            <input
                                className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                id="phone"
                                name="phone"
                                type="tel"
                                placeholder="0600000000"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                htmlFor="password"
                            >
                                كلمة المرور
                            </label>
                            <input
                                className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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
                        لديك حساب بالفعل؟{' '}
                        <a href="/login" className="font-semibold text-primary hover:underline">
                            تسجيل الدخول
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
