'use server'

import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { MediaType } from '@prisma/client'

export async function createPost(
    caption: string,
    mediaUrl: string,
    type: 'POST' | 'OFFER' = 'POST',
    mediaType: 'IMAGE' | 'VIDEO' = 'IMAGE',
    latitude?: number,
    longitude?: number
) {
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get('user_id')?.value

        if (!userId) {
            return { success: false, error: 'Unauthorized: Please login' }
        }
        if (!mediaUrl) {
            return { success: false, error: 'Media URL is required' }
        }

        // C-4 FIX: Validate mediaType instead of using unsafe `as` assertion
        const validMediaTypes: MediaType[] = ['IMAGE', 'VIDEO']
        if (!validMediaTypes.includes(mediaType as MediaType)) {
            return { success: false, error: 'نوع الوسائط غير صالح' }
        }

        const post = await db.socialPost.create({
            data: {
                userId,
                caption,
                mediaUrl,
                type,
                mediaType,
                latitude,
                longitude
            },
            include: {
                user: { select: { username: true } }
            }
        })

        if (post.user?.username) {
            revalidatePath(`/u/${post.user.username}`)
        }
        revalidatePath('/dashboard')
        return { success: true, post }
    } catch (error) {
        console.error('Error creating post:', error)
        return { success: false, error: 'Failed to create post' }
    }
}

/**
 * Fetches recent map posts within a specific geographic area (viewport).
 * Includes user reputation and verification status.
 * @param bounds - Optional map viewport boundaries { north, south, east, west }
 * @returns Array of social posts with location data
 */
export async function getMapPosts(bounds?: { north: number, south: number, east: number, west: number }) {
    try {
        const posts = await db.socialPost.findMany({
            where: {
                latitude: bounds ? { gte: bounds.south, lte: bounds.north } : { not: null },
                longitude: bounds ? { gte: bounds.west, lte: bounds.east } : { not: null }
            },
            take: 50,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
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
