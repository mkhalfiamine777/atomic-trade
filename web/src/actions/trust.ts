'use server'

import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { submitTransactionRating } from '@/services/trustService'

export async function submitReview(targetUserId: string, listingId: string, rating: number, comment: string) {
    try {
        const cookieStore = await cookies()
        const currentUserId = cookieStore.get('user_id')?.value

        if (!currentUserId) {
            return { success: false, error: 'يجب تسجيل الدخول لإرسال تقييم' }
        }

        if (currentUserId === targetUserId) {
            return { success: false, error: 'لا يمكنك تقييم نفسك!' }
        }

        // S-1 FIX: Verify that a real transaction/conversation exists between the two users
        const conversation = await db.conversation.findFirst({
            where: {
                listingId: listingId,
                OR: [
                    { participant1Id: currentUserId, participant2Id: targetUserId },
                    { participant1Id: targetUserId, participant2Id: currentUserId }
                ]
            }
        })

        if (!conversation) {
            return { success: false, error: 'لا يمكنك التقييم بدون معاملة سابقة مع هذا المستخدم' }
        }

        const result = await submitTransactionRating(currentUserId, targetUserId, listingId, rating, comment)
        return { success: true, newScore: result.newScore }

    } catch (error: unknown) {
        console.error('Submit Review Error:', error)
        return { success: false, error: error instanceof Error ? error.message : 'حدث خطأ غير معروف' }
    }
}
