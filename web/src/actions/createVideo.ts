'use server'

import { revalidatePath } from 'next/cache'


import { db } from '@/lib/db'

export async function createVideoPost(formData: FormData) {
    try {
        const videoUrl = formData.get('videoUrl') as string
        const description = formData.get('description') as string
        const duration = formData.get('duration')

        // TODO: Get real User ID from session
        const userId = 'user-1'

        if (!videoUrl || !userId) {
            throw new Error('Video URL and User ID are required')
        }

        await db.socialPost.create({
            data: {
                userId: userId,
                mediaUrl: videoUrl,
                mediaType: 'VIDEO',
                caption: description
            }
        })

        revalidatePath('/feed')
        return { success: true, error: undefined }
    } catch (error) {
        console.error('Error creating video post:', error)
        return { success: false, error: 'Failed to create post' }
    }
}
