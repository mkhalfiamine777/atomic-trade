'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Flame } from 'lucide-react'

interface StreakStatus {
    success: boolean
    streakAdded?: boolean
    currentStreak?: number
    coinsRewarded?: number
    message?: string
}

export function StreakNotifier({ status }: { status: StreakStatus }) {
    const [hasFired, setHasFired] = useState(false)

    useEffect(() => {
        if (hasFired) return

        if (status.success) {
            if (status.streakAdded && status.message) {
                // User got a new streak day!
                toast.success(status.message, {
                    icon: <Flame className="w-5 h-5 text-orange-500 animate-pulse" />,
                    duration: 5000,
                })
            }
            setHasFired(true)
        }
    }, [status, hasFired])

    if (!status.success || !status.currentStreak) return null

    return (
        <div className="fixed top-4 left-4 z-50 flex items-center gap-1.5 bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full text-sm font-bold shadow-lg shadow-orange-500/10">
            <Flame className={`w-4 h-4 ${status.streakAdded ? 'text-orange-500 animate-pulse' : 'text-orange-400'}`} />
            <span className="text-white drop-shadow-md" dir="ltr">{status.currentStreak} 🔥</span>
        </div>
    )
}
