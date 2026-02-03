'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function interactWithUser(
    targetUserId: string,
    actorId: string,
    type: 'LIKE' | 'LOVE' | 'FOLLOW'
) {
    if (!actorId || !targetUserId) return { success: false, error: 'Missing IDs' }
    if (actorId === targetUserId) return { success: false, error: 'Cannot interact with yourself' }

    try {
        // Check if already interacted (prevent duplicate likes/loves if needed, or allow multiple for LOVE?)
        // For LIKE, usually it's a toggle. For LOVE, maybe multiple?
        // Let's assume LIKE is unique per user-target, LOVE is multiple (or unique too for now).
        // For simplicity in this MVP, we just create a new interaction record.
        // But for LIKE, we should probably check existence.

        if (type === 'LIKE' || type === 'FOLLOW') {
            const existing = await db.interaction.findFirst({
                where: {
                    userId: actorId,
                    targetUserId: targetUserId,
                    type: type
                }
            })

            if (existing) {
                // If already liked/followed, maybe toggle off?
                // For now, let's just return success if already done (idempotent) or toggle.
                // Let's implement toggle for LIKE and FOLLOW.
                await db.interaction.delete({ where: { id: existing.id } })
                revalidatePath(`/u/${targetUserId}`)
                return { success: true, action: 'removed' }
            }
        }

        // Create new interaction
        await db.interaction.create({
            data: {
                type,
                userId: actorId,
                targetUserId: targetUserId
            }
        })

        // Update reputation score?
        // Simple logic: LIKE = +1, LOVE = +5, FOLLOW = +10
        let scoreIncrement = 0
        if (type === 'LIKE') scoreIncrement = 1
        if (type === 'LOVE') scoreIncrement = 5
        if (type === 'FOLLOW') scoreIncrement = 10

        if (scoreIncrement > 0) {
            await db.user.update({
                where: { id: targetUserId },
                data: { reputationScore: { increment: scoreIncrement } }
            })
        }

        revalidatePath(`/u/${targetUserId}`)
        return { success: true, action: 'added' }
    } catch (error) {
        console.error('Interaction error:', error)
        return { success: false, error: 'Failed to interact' }
    }
}

// 👇 NEW: Handle interactions for Listings (Products/Requests)
export async function interactWithListing(
    listingId: string,
    actorId: string,
    type: 'LIKE' | 'LOVE'
) {
    if (!actorId || !listingId) return { success: false, error: 'Missing IDs' }

    try {
        // Check for existing interaction
        const existing = await db.interaction.findFirst({
            where: {
                userId: actorId,
                listingId: listingId,
                type: type
            }
        })

        if (existing) {
            // Toggle OFF (Remove like)
            await db.interaction.delete({ where: { id: existing.id } })
            revalidatePath('/dashboard')
            return { success: true, action: 'removed' }
        }

        // Toggle ON (Add like)
        await db.interaction.create({
            data: {
                type,
                userId: actorId,
                listingId: listingId
            }
        })

        revalidatePath('/dashboard')
        return { success: true, action: 'added' }

    } catch (error) {
        console.error('Listing Interaction Error:', error)
        return { success: false, error: 'Failed to interact' }
    }
}

export async function addComment(
    listingId: string,
    userId: string,
    content: string
) {
    if (!userId || !listingId || !content.trim()) return { success: false, error: 'Invalid data' }

    try {
        await db.interaction.create({
            data: {
                type: 'COMMENT',
                content: content.trim(),
                userId: userId,
                listingId: listingId
            }
        })

        revalidatePath('/dashboard')
        return { success: true }
    } catch (error) {
        console.error('Add Comment Error:', error)
        return { success: false, error: 'Failed to post comment' }
    }
}

export async function getComments(listingId: string) {
    if (!listingId) return []

    try {
        const comments = await db.interaction.findMany({
            where: {
                listingId: listingId,
                type: 'COMMENT'
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                        reputationScore: true,
                        isVerified: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        return comments
    } catch (error) {
        console.error('Get Comments Error:', error)
        return []
    }
}
