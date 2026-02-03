'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

// Global Error components must include html and body tags
export default function GlobalError({
    error,
    reset
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('🔥 Global Application Error:', error)
    }, [error])

    return (
        <html dir="rtl" lang="ar">
            <body className="bg-zinc-950 text-white min-h-screen flex items-center justify-center p-4 font-sans">
                <div className="bg-zinc-900 border border-red-500/30 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
                    <div className="bg-red-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle className="w-10 h-10 text-red-500" />
                    </div>

                    <h2 className="text-2xl font-bold mb-2">عذراً، حدث خطأ غير متوقع!</h2>
                    <p className="text-zinc-400 mb-8 leading-relaxed">
                        واجه التطبيق مشكلة تقنية حرجة. فريقنا يعمل على إصلاحها الآن.
                        <br />
                        <span className="text-xs text-zinc-600 mt-2 block font-mono bg-black/30 p-1 rounded">
                            Error Code: {error.digest || 'Unknown'}
                        </span>
                    </p>

                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => reset()}
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium transition-colors w-full"
                        >
                            حاول مرة أخرى ↺
                        </button>
                    </div>
                </div>
            </body>
        </html>
    )
}
