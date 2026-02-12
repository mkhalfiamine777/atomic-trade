'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function createPost(
    userId: string,
    caption: string,
    mediaUrl: string,
    type: 'POST' | 'OFFER' = 'POST',
    latitude?: number,
    longitude?: number
) {
    try {
        if (!userId) throw new Error('User ID is required')
        if (!mediaUrl) throw new Error('Media URL is required')

        const post = await db.socialPost.create({
            data: {
                userId,
                caption,
                mediaUrl,
                type,
                mediaType: 'IMAGE', // Defaulting to Image for MVP
                latitude,
                longitude
            }
        })

        revalidatePath(`/u/${userId}`)
        return { success: true, post }
    } catch (error) {
        console.error('Error creating post:', error)
        return { success: false, error: 'Failed to create post' }
    }
}

export async function getMapPosts() {
    try {
        const posts = await db.socialPost.findMany({
            where: {
                latitude: { not: null },
                longitude: { not: null }
            },
            take: 50,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        name: true,
                        avatarUrl: true,
                        reputationScore: true,
                        isVerified: true,
                        type: true
                    }
                }
            }
        })
        return posts
    } catch (error) {
        console.error('Error fetching map posts:', error)
        return []
    }
}
