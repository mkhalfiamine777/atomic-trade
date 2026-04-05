'use server'

import { db } from '@/lib/db'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { MediaType } from '@prisma/client'

export async function createStory(formData: FormData) {
    try {
        const mediaUrl = formData.get('mediaUrl') as string
        const caption = formData.get('caption') as string
        const latitude = parseFloat(formData.get('latitude') as string)
        const longitude = parseFloat(formData.get('longitude') as string)
        const rawMediaType = formData.get('mediaType') as string | null
        const validMediaTypes: MediaType[] = [MediaType.IMAGE, MediaType.VIDEO]
        const mediaType = validMediaTypes.includes(rawMediaType as MediaType) ? (rawMediaType as MediaType) : MediaType.IMAGE

        // 🛡️ Auth: Use cookie, NEVER trust FormData userId
        const cookieStore = await cookies()
        const userId = cookieStore.get('user_id')?.value

        if (!userId || !mediaUrl) {
            return { error: 'Missing file or authentication' }
        }

        // Save to DB
        // Expires in 24 hours
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

        const operations: any[] = [
            db.mapStory.create({
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
        ]
        
        if (latitude != null && longitude != null && !isNaN(latitude) && !isNaN(longitude)) {
            operations.push(
                db.user.update({
                    where: { id: userId },
                    data: { latitude, longitude }
                })
            )
        }

        await db.$transaction(operations)

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
