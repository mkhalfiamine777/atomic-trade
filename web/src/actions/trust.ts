'use server'

import { cookies } from 'next/headers'
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

        const result = await submitTransactionRating(currentUserId, targetUserId, listingId, rating, comment)
        return { success: true, newScore: result.newScore }

    } catch (error: unknown) {
        console.error('Submit Review Error:', error)
        return { success: false, error: error instanceof Error ? error.message : 'حدث خطأ غير معروف' }
    }
}
