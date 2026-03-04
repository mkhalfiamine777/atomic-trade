'use server'

import { db } from '@/lib/db'
import { cookies } from 'next/headers'

/**
 * 🔥 Daily Streak Logic (Phase 4 of Explore Addiction Engine)
 * Checks the user's last login date. If consecutive, increments the streak and
 * acts as an engagement loop multiplier for rewards.
 */
export async function checkAndUpdateStreak(): Promise<{ success: boolean, streakAdded?: boolean, currentStreak?: number, coinsRewarded?: number, message?: string }> {
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get('user_id')?.value

        if (!userId) {
            return { success: false }
        }

        const user = await db.user.findUnique({
            where: { id: userId },
            select: { streakDays: true, lastStreakDate: true }
        })

        if (!user) return { success: false }

        // Time logic: Normalize dates to midnight to compare 'Days' accurately
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const lastStreak = user.lastStreakDate ? new Date(user.lastStreakDate.getFullYear(), user.lastStreakDate.getMonth(), user.lastStreakDate.getDate()) : null

        if (lastStreak && lastStreak.getTime() === today.getTime()) {
            // Already claimed today
            return {
                success: true,
                streakAdded: false,
                currentStreak: user.streakDays
            }
        }

        let newStreak = 1
        let isConsecutive = false

        if (lastStreak) {
            // Calculate difference in days
            const diffTime = Math.abs(today.getTime() - lastStreak.getTime())
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

            if (diffDays === 1) {
                // Consecutive day! 🚀
                newStreak = user.streakDays + 1
                isConsecutive = true
            } else {
                // Streak broken 💔
                newStreak = 1
            }
        }

        // Reward calculation based on streak (e.g., Day 1 = 10, Day 2 = 20, Day 3 = 30)
        const coinsRewarded = newStreak * 10

        // Update database
        await db.user.update({
            where: { id: userId },
            data: {
                streakDays: newStreak,
                lastStreakDate: now,
                coins: { increment: coinsRewarded }
            }
        })

        const message = isConsecutive
            ? `🔥 يوم جديد في السلسلة! لقد ربحت ${coinsRewarded} عملة إضافية لتصل لسلسلة ${newStreak} أيام متتالية.`
            : `🔥 بداية سلسلة جديدة! لقد ربحت ${coinsRewarded} عملة لعودتك!`

        return {
            success: true,
            streakAdded: true,
            currentStreak: newStreak,
            coinsRewarded,
            message
        }

    } catch (error) {
        console.error('Error updating streak:', error)
        return { success: false }
    }
}
