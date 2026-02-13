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

export async function interactWithUser(targetUserId: string, actorUserId: string, type: 'LIKE' | 'LOVE') {
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get('user_id')?.value
        if (!userId || userId !== actorUserId) return { success: false, error: 'Unauthorized' }

        const existing = await db.interaction.findFirst({
            where: { userId: actorUserId, targetUserId, type }
        })
        if (existing) {
            await db.interaction.delete({ where: { id: existing.id } })
            return { success: true, action: 'removed' }
        }
        await db.interaction.create({
            data: { type, userId: actorUserId, targetUserId }
        })
        return { success: true, action: 'added' }
    } catch (error) {
        console.error('Error interacting with user:', error)
        return { success: false, error: 'Database error' }
    }
}

export async function interactWithListing(listingId: string, actorUserId: string, type: 'LIKE' | 'LOVE') {
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get('user_id')?.value
        if (!userId || userId !== actorUserId) return { success: false, error: 'Unauthorized' }

        const existing = await db.interaction.findFirst({
            where: { userId: actorUserId, listingId, type }
        })
        if (existing) {
            await db.interaction.delete({ where: { id: existing.id } })
            return { success: true, action: 'removed' }
        }
        await db.interaction.create({
            data: { type, userId: actorUserId, listingId }
        })
        return { success: true, action: 'added' }
    } catch (error) {
        console.error('Error interacting with listing:', error)
        return { success: false, error: 'Database error' }
    }
}
