'use server'

import { revalidatePath } from 'next/cache'


import { db } from '@/lib/db'

export async function toggleLike(postId: string, userId: string) {
    try {
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
                user: true
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

export async function addComment(targetId: string, userId: string, content: string) {
    try {
        const newComment = await db.interaction.create({
            data: {
                type: 'COMMENT',
                content: content,
                userId: userId,
                postId: targetId
            },
            include: {
                user: true
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
    await new Promise(resolve => setTimeout(resolve, 500))
    return { success: true, action: 'added' }
}

export async function interactWithListing(listingId: string, actorUserId: string, type: 'LIKE' | 'LOVE') {
    await new Promise(resolve => setTimeout(resolve, 500))
    return { success: true, action: 'added' }
}
