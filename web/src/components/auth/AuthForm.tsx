'use client'

import { login, signup } from '@/actions/auth'
import { useActionState, useEffect, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { toast } from 'sonner'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface AuthFormProps {
    mode: 'login' | 'signup'
}

const initialState = {
    error: ''
}

function SubmitButton({ mode }: { mode: 'login' | 'signup' }) {
    const { pending } = useFormStatus()
    const text = mode === 'login'
        ? (pending ? 'جاري التحقق...' : 'دخول')
        : (pending ? 'جاري الإنشاء...' : 'إنشاء حساب جديد')

    return (
        <Button
            type="submit"
            disabled={pending}
            className="w-full h-12 text-lg font-medium"
        >
            {text}
        </Button>
    )
}

export function AuthForm({ mode }: AuthFormProps) {
    const action = mode === 'login' ? login : signup
    const [state, formAction] = useActionState(action, initialState)
    const [accountType, setAccountType] = useState('INDIVIDUAL')

    useEffect(() => {
        if (state?.error) {
            toast.error(state.error)
        }
    }, [state])

    return (
        <form action={formAction} className="space-y-6 text-right" dir="rtl">
            {/* Signup: Account Type Toggle */}
            {mode === 'signup' && (
                <>
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
                        <label className="text-sm font-medium leading-none" htmlFor="name">
                            {accountType === 'SHOP' ? 'اسم المتجر التجاري' : 'الاسم الكامل'}
                        </label>
                        <Input
                            id="name"
                            name="name"
                            required
                            placeholder={accountType === 'SHOP' ? 'مثلاً: بقالة الأمانة' : 'مثلاً: محمد عبده'}
                        />
                    </div>

                    {accountType === 'SHOP' && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none" htmlFor="shopCategory">
                                نوع النشاط
                            </label>
                            <select
                                className="flex h-12 w-full rounded-md border border-input bg-zinc-950 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
                </>
            )}

            {/* Shared Fields */}
            <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="phone">
                    رقم الهاتف
                </label>
                <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="0600000000"
                    required
                    className="text-right" /* Ensure LTR typing for numbers if needed, currently RTL inherited */
                    dir="ltr"
                />
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium leading-none" htmlFor="password">
                        كلمة المرور
                    </label>
                    {mode === 'login' && (
                        <Link href="#" className="text-xs text-primary hover:underline">
                            نسيت كلمة المرور؟
                        </Link>
                    )}
                </div>
                <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    dir="ltr"
                />
            </div>

            {state?.error && (
                <div className="text-red-500 text-sm font-medium text-center">
                    ⚠️ {state.error}
                </div>
            )}

            <SubmitButton mode={mode} />

            <div className="text-center text-sm text-muted-foreground mt-4">
                {mode === 'login' ? (
                    <>
                        ليس لديك حساب؟{' '}
                        <Link href="/signup" className="font-semibold text-primary hover:underline">
                            أنشئ حساباً جديداً
                        </Link>
                    </>
                ) : (
                    <>
                        لديك حساب بالفعل؟{' '}
                        <Link href="/login" className="font-semibold text-primary hover:underline">
                            تسجيل الدخول
                        </Link>
                    </>
                )}
            </div>
        </form>
    )
}
