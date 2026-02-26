import { db } from '@/lib/db'

/**
 * Advanced Trust AI Service
 * Handles dynamic reputation scoring for users based on their interactions and transaction feedback.
 */

// Define weights for different actions
const RATING_WEIGHTS = {
    5: 10,   // Excellent transaction: +10 points
    4: 5,    // Good transaction: +5 points
    3: 0,    // Neutral: no change
    2: -5,   // Poor transaction: -5 points
    1: -15,  // Terrible transaction: -15 points
}

// Maximum and minimum possible scores
const MAX_SCORE = 1000
const MIN_SCORE = 0

/**
 * Submit a post-transaction rating and update the user's reputation score.
 * 
 * @param raterId The ID of the user giving the rating.
 * @param targetUserId The ID of the user receiving the rating.
 * @param listingId The ID of the item/request involved in the transaction.
 * @param rating The star rating from 1 to 5.
 * @param comment Optional feedback comment.
 */
export async function submitTransactionRating(
    raterId: string,
    targetUserId: string,
    listingId: string,
    rating: number,
    comment?: string
) {
    if (rating < 1 || rating > 5) {
        throw new Error("Rating must be between 1 and 5")
    }

    // 1. Record the interaction
    await db.interaction.create({
        data: {
            type: 'RATING',
            rating: rating,
            content: comment,
            userId: raterId,
            targetUserId: targetUserId,
            listingId: listingId
        }
    })

    // 2. Calculate reputation adjustment
    const scoreAdjustment = RATING_WEIGHTS[rating as keyof typeof RATING_WEIGHTS]

    if (scoreAdjustment === 0) return { success: true, message: 'Neutral rating recorded' }

    // 3. Update the target user's reputation score within boundaries
    const targetUser = await db.user.findUnique({
        where: { id: targetUserId },
        select: { reputationScore: true }
    })

    if (!targetUser) {
        throw new Error("Target user not found")
    }

    let newScore = targetUser.reputationScore + scoreAdjustment

    // Enforce limits
    if (newScore > MAX_SCORE) newScore = MAX_SCORE
    if (newScore < MIN_SCORE) newScore = MIN_SCORE

    await db.user.update({
        where: { id: targetUserId },
        data: { reputationScore: newScore }
    })

    return {
        success: true,
        newScore,
        adjustment: scoreAdjustment
    }
}
