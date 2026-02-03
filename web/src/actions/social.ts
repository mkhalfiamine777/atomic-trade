'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function createPost(
    userId: string,
    caption: string,
    mediaUrl: string,
    type: 'POST' | 'OFFER' = 'POST'
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
                mediaType: 'IMAGE' // Defaulting to Image for MVP
            }
        })

        revalidatePath(`/u/${userId}`)
        return { success: true, post }
    } catch (error) {
        console.error('Error creating post:', error)
        return { success: false, error: 'Failed to create post' }
    }
}
