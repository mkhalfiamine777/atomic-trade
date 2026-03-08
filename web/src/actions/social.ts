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
            }
        })

        // Fetch username for correct revalidation path
        const user = await db.user.findUnique({ where: { id: userId }, select: { username: true } })
        if (user?.username) {
            revalidatePath(`/u/${user.username}`)
        }
        revalidatePath('/dashboard')
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
