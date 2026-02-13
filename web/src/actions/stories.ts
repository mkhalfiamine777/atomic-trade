'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function createStory(formData: FormData) {
    try {
        const mediaUrl = formData.get('mediaUrl') as string
        const caption = formData.get('caption') as string
        const userId = formData.get('userId') as string
        const latitude = parseFloat(formData.get('latitude') as string)
        const longitude = parseFloat(formData.get('longitude') as string)
        const mediaType = (formData.get('mediaType') as string) || 'IMAGE' // Passed from client

        if (!mediaUrl || !userId) {
            return { error: 'Missing file or user ID' }
        }

        // Save to DB
        // Expires in 24 hours
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

        await db.mapStory.create({
            data: {
                mediaUrl, // URL from Uploadthing
                mediaType,
                caption,
                latitude,
                longitude,
                userId,
                expiresAt
            }
        })

        revalidatePath('/dashboard')
        return { success: true }
    } catch (error) {
        console.error('Error creating story:', error)
        return { error: 'Failed to create story' }
    }
}

export async function getStories() {
    try {
        // Fetch valid (non-expired) stories
        const stories = await db.mapStory.findMany({
            where: {
                expiresAt: {
                    gt: new Date()
                }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        avatarUrl: true,
                        type: true,
                        latitude: true,
                        longitude: true,
                        reputationScore: true, // 🛡️ Trust Score
                        isVerified: true // ✅ Verified Badge
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        // Live Stories Logic:
        // If user is INDIVIDUAL, use their current live location (User.latitude)
        // If user is SHOP (or missing location), use the story's original location (MapStory.latitude)
        return stories.map(story => {
            if (story.user.type === 'INDIVIDUAL' && story.user.latitude && story.user.longitude) {
                return {
                    ...story,
                    latitude: story.user.latitude,
                    longitude: story.user.longitude
                }
            }
            return story
        })
    } catch (error) {
        console.error('Error fetching stories:', error)
        return []
    }
}
