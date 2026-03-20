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

export async function getComments(targetId: string, cursor?: string) {
    try {
        const comments = await db.interaction.findMany({
            where: {
                postId: targetId,
                type: 'COMMENT'
            },
            take: 20,
            ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
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

        return {
            comments: comments.map(c => ({
                id: c.id,
                content: c.content || '',
                createdAt: c.createdAt,
                user: {
                    id: c.user.id,
                    name: c.user.name || 'مستخدم',
                    avatarUrl: c.user.avatarUrl,
                    isVerified: c.user.isVerified
                }
            })),
            nextCursor: comments.length === 20 ? comments[comments.length - 1].id : undefined
        }
    } catch (error) {
        console.error('Error fetching comments:', error)
        return { comments: [], nextCursor: undefined }
    }
}

export async function addComment(targetId: string, content: string) {
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get('user_id')?.value

        if (!userId) {
            return { success: false, error: 'Unauthorized: Please login' }
        }

        // Validate comment content
        const trimmedContent = content.trim()
        if (!trimmedContent || trimmedContent.length === 0) {
            return { success: false, error: 'التعليق فارغ' }
        }
        if (trimmedContent.length > 500) {
            return { success: false, error: 'التعليق طويل جداً (500 حرف كحد أقصى)' }
        }

        const newComment = await db.interaction.create({
            data: {
                type: 'COMMENT',
                content: trimmedContent,
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

        // Crowd Price Drop Logic — Race-safe with interactive $transaction
        let priceDropped = false
        let newPrice: number | undefined = undefined
        let currentLikes: number | undefined = undefined

        if (type === 'LIKE') {
            const result = await db.$transaction(async (tx) => {
                const listing = await tx.listing.findUnique({
                    where: { id: listingId },
                    select: { crowdTarget: true, crowdDiscount: true, price: true }
                })

                if (!listing?.crowdTarget || !listing?.crowdDiscount) {
                    return { dropped: false }
                }

                const likeCount = await tx.interaction.count({
                    where: { listingId, type: 'LIKE' }
                })

                if (likeCount >= listing.crowdTarget) {
                    const calculatedPrice = Math.max(0, listing.price - (listing.price * (listing.crowdDiscount / 100)))
                    const updated = await tx.listing.updateMany({
                        where: {
                            id: listingId,
                            crowdTarget: { not: null }
                        },
                        data: {
                            price: calculatedPrice,
                            crowdTarget: null,
                            crowdDiscount: null
                        }
                    })
                    return { dropped: updated.count > 0, price: calculatedPrice, likes: likeCount }
                }

                return { dropped: false, likes: likeCount }
            })

            priceDropped = result.dropped
            newPrice = result.price
            currentLikes = result.likes
        }

        return { success: true, action: 'added', priceDropped, newPrice, currentLikes }
    } catch (error) {
        console.error('Error interacting with listing:', error)
        return { success: false, error: 'Database error' }
    }
}
