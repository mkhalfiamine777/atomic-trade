'use client'

import { useEffect } from 'react'

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Dashboard Error:', error)
    }, [error])

    return (
        <div className="h-screen w-full bg-zinc-950 flex items-center justify-center p-4">
            <div className="bg-zinc-900/50 backdrop-blur-xl border border-red-500/20 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
                <div className="text-5xl mb-4">⚠️</div>
                <h2 className="text-xl font-bold text-red-400 mb-2">حدث خطأ غير متوقع</h2>
                <p className="text-zinc-400 text-sm mb-6">
                    حدث خطأ أثناء تحميل لوحة التحكم. يرجى المحاولة مرة أخرى.
                </p>
                <button
                    onClick={reset}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium px-6 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/20"
                >
                    🔄 إعادة المحاولة
                </button>
            </div>
        </div>
    )
}
