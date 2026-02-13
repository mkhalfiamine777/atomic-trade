'use server'

import { revalidatePath } from 'next/cache'


import { cookies } from 'next/headers'
import { db } from '@/lib/db'

export async function createVideoPost(formData: FormData) {
    try {
        const videoUrl = formData.get('videoUrl') as string
        const description = formData.get('description') as string

        const cookieStore = await cookies()
        const userId = cookieStore.get('user_id')?.value

        if (!userId) {
            return { success: false, error: 'Unauthorized: No user logged in' }
        }

        if (!videoUrl) {
            return { success: false, error: 'Video URL is required' }
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
