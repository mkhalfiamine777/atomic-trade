'use server'

import { cookies } from 'next/headers'
import { db } from '@/lib/db'

export async function toggleLike(postId: string) {
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get('user_id')?.value

        if (!userId) {
            return { liked: false, error: 'Unauthorized: Please login' }
        }

        const existingLike = await db.interaction.findFirst({
            where: {
                userId: userId,
                postId: postId,
                type: 'LIKE'
            }
        })

        if (existingLike) {
            await db.interaction.delete({
                where: { id: existingLike.id }
            })
            return { liked: false, error: undefined }
        } else {
            await db.interaction.create({
                data: {
                    type: 'LIKE',
                    userId: userId,
                    postId: postId
                }
            })
            return { liked: true, error: undefined }
        }
    } catch (error) {
        console.error('Error toggling like:', error)
        return { liked: false, error: 'Database error' }
    }
}

export async function getComments(targetId: string) {
    try {
        const comments = await db.interaction.findMany({
            where: {
                postId: targetId,
                type: 'COMMENT'
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                        isVerified: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return comments.map(c => ({
            id: c.id,
            content: c.content || '',
            createdAt: c.createdAt,
            user: {
                id: c.user.id,
                name: c.user.name || 'مستخدم',
                avatarUrl: c.user.avatarUrl,
                isVerified: c.user.isVerified
            }
        }))
    } catch (error) {
        console.error('Error fetching comments:', error)
        return []
    }
}

export async function addComment(targetId: string, content: string) {
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get('user_id')?.value

        if (!userId) {
            return { success: false, error: 'Unauthorized: Please login' }
        }

        const newComment = await db.interaction.create({
            data: {
                type: 'COMMENT',
                content: content,
                userId: userId,
                postId: targetId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                        isVerified: true
                    }
                }
            }
        })

        return {
            success: true,
            comment: {
                id: newComment.id,
                content: newComment.content || '',
                createdAt: newComment.createdAt,
                user: {
                    id: newComment.user.id,
                    name: newComment.user.name || 'مستخدم',
                    avatarUrl: newComment.user.avatarUrl,
                    isVerified: newComment.user.isVerified
                }
            }
        }
    } catch (error) {
        console.error('Error adding comment:', error)
        return { success: false, error: 'Failed to add comment' }
    }
}

export async function interactWithUser(targetUserId: string, type: 'LIKE' | 'LOVE') {
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get('user_id')?.value
        if (!userId) return { success: false, error: 'Unauthorized' }

        const existing = await db.interaction.findFirst({
            where: { userId: userId, targetUserId, type }
        })
        if (existing) {
            await db.interaction.delete({ where: { id: existing.id } })
            return { success: true, action: 'removed' }
        }
        await db.interaction.create({
            data: { type, userId: userId, targetUserId }
        })
        return { success: true, action: 'added' }
    } catch (error) {
        console.error('Error interacting with user:', error)
        return { success: false, error: 'Database error' }
    }
}

export async function interactWithListing(listingId: string, type: 'LIKE' | 'LOVE') {
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get('user_id')?.value
        if (!userId) return { success: false, error: 'Unauthorized' }

        const existing = await db.interaction.findFirst({
            where: { userId: userId, listingId, type }
        })
        if (existing) {
            await db.interaction.delete({ where: { id: existing.id } })
            return { success: true, action: 'removed' }
        }
        await db.interaction.create({
            data: { type, userId: userId, listingId }
        })

        // 🔥 Crowd Price Drop Logic (Phase 6)
        let priceDropped = false
        let newPrice = undefined
        let currentLikes = undefined

        if (type === 'LIKE') {
            const listing = await db.listing.findUnique({
                where: { id: listingId },
                select: { crowdTarget: true, crowdDiscount: true, price: true }
            })

            if (listing?.crowdTarget && listing?.crowdDiscount) {
                currentLikes = await db.interaction.count({
                    where: { listingId, type: 'LIKE' }
                })

                if (currentLikes >= listing.crowdTarget) {
                    // Target hit! Apply the discount (assuming crowdDiscount is a percentage like 30)
                    newPrice = Math.max(0, listing.price - (listing.price * (listing.crowdDiscount / 100)))

                    await db.listing.update({
                        where: { id: listingId },
                        data: {
                            price: newPrice,
                            crowdTarget: null, // Clear so it only drops once
                            crowdDiscount: null
                        }
                    })
                    priceDropped = true
                }
            }
        }

        return { success: true, action: 'added', priceDropped, newPrice, currentLikes }
    } catch (error) {
        console.error('Error interacting with listing:', error)
        return { success: false, error: 'Database error' }
    }
}
