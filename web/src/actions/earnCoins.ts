'use server'

import { db } from '@/lib/db'
import { cookies } from 'next/headers'

/**
 * 🪙 Watch-To-Earn Logic (Phase 3 of Explore Addiction Engine)
 * Awards the user coins when they completely watch a video in the Explore feed.
 * It also logs a WATCH_COMPLETE interaction to prevent double-awarding and enforces a daily cap.
 *
 * @param postId - ID of the social post being watched
 * @returns Object indicating success, coinsEarned, newBalance, and a user-friendly message.
 */
export async function awardCoinsForWatch(postId: string): Promise<{ success: boolean, coinsEarned?: number, newBalance?: number, message?: string }> {
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get('user_id')?.value

        if (!userId) {
            return { success: false, message: 'يجب تسجيل الدخول لربح العملات' }
        }

        // 0. Only allow SocialPosts to be eligible (prevents foreign key errors for Stories)
        const postExists = await db.socialPost.findUnique({
            where: { id: postId },
            select: { id: true }
        })

        if (!postExists) {
            return { success: false, message: 'هذا المحتوى غير مؤهل لربح العملات' }
        }

        // 1. Check if the user has already been awarded for this video
        const existingInteraction = await db.interaction.findFirst({
            where: {
                userId: userId,
                postId: postId,
                type: 'WATCH_COMPLETE'
            }
        })

        if (existingInteraction) {
            return { success: false, message: 'لقد ربحت عملات هذا الفيديو مسبقاً' }
        }

        // L-3 FIX: Daily video watch cap to prevent bot abuse
        // Each video earns 5-15 coins, so 20 watches = ~100-300 coins/day
        const DAILY_VIDEO_CAP = 20
        const todayStart = new Date()
        todayStart.setHours(0, 0, 0, 0)

        const todayWatchCount = await db.interaction.count({
            where: {
                userId: userId,
                type: 'WATCH_COMPLETE',
                createdAt: { gte: todayStart }
            }
        })

        if (todayWatchCount >= DAILY_VIDEO_CAP) {
            return { success: false, message: 'وصلت الحد اليومي! عد غداً لربح المزيد 💰' }
        }

        // 2. Define the reward amount (could be randomized for more dopamine, e.g., 5-15 coins)
        const coinsEarned = Math.floor(Math.random() * 11) + 5 // Random number between 5 and 15

        // 3. Perform a transaction to log the interaction and credit the user safely
        const [_, updatedUser] = await db.$transaction([
            db.interaction.create({
                data: {
                    type: 'WATCH_COMPLETE',
                    userId: userId,
                    postId: postId,
                }
            }),
            db.user.update({
                where: { id: userId },
                data: {
                    coins: { increment: coinsEarned }
                },
                select: { coins: true }
            })
        ])

        return {
            success: true,
            coinsEarned,
            newBalance: updatedUser.coins,
            message: `🎉 لقد ربحت ${coinsEarned} عملة معدنية ذهبية!`
        }

    } catch (error) {
        console.error('Error awarding coins:', error)
        return { success: false, message: 'فشل في الاتصال، حاول مجدداً.' }
    }
}
