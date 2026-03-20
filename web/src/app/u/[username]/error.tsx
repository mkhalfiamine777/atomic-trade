'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function ProfileError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Profile Error:', error)
    }, [error])

    return (
        <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 text-zinc-100">
            <div className="bg-zinc-900/50 backdrop-blur-xl border border-red-500/20 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
                <div className="text-5xl mb-4">😵</div>
                <h2 className="text-xl font-bold text-red-400 mb-2">تعذّر تحميل الملف الشخصي</h2>
                <p className="text-zinc-400 text-sm mb-6">
                    حدث خطأ أثناء تحميل بيانات المستخدم. يرجى المحاولة مرة أخرى.
                </p>
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={reset}
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium px-6 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/20"
                    >
                        🔄 إعادة المحاولة
                    </button>
                    <Link
                        href="/dashboard"
                        className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium px-6 py-3 rounded-xl transition-colors"
                    >
                        🗺️ الخريطة
                    </Link>
                </div>
            </div>
        </main>
    )
}
