'use server'

import { db } from '@/lib/db'
import type { Prisma } from '@prisma/client'

// Define the shape of a Feed Item (Video, Image, or Story)
export type FeedItemDTO = {
    id: string
    type: 'VIDEO' | 'IMAGE' | 'STORY'
    url: string
    poster?: string
    username: string
    userAvatar?: string
    description: string
    likes: number
    comments: number
    shares: number
    location?: string
    isShop: boolean
    isLiked: boolean
    createdAt: Date
    expiresAt?: Date // For stories
}

// Type for SocialPost with user and interactions included
type PostWithRelations = Prisma.SocialPostGetPayload<{
    include: {
        user: { select: { id: true; name: true; avatarUrl: true; type: true; isVerified: true } }
        interactions: { select: { type: true; userId: true } }
    }
}>

// Type for MapStory with user included
type StoryWithUser = Prisma.MapStoryGetPayload<{
    include: {
        user: { select: { id: true; name: true; avatarUrl: true; type: true; isVerified: true } }
    }
}>

export async function getMixedFeed(page = 1, limit = 10, currentUserId?: string): Promise<FeedItemDTO[]> {
    try {
        // MIXED FEED ALGORITHM:
        // 1. Fetch recent SocialPosts (VIDEO + IMAGE)
        // 2. Fetch active MapStories
        // 3. Mix and Shuffle

        // 1. Delegate core logic to the dedicated feedService
        const { getMixedFeedLogic } = await import('@/services/feedService')
        const combined = await getMixedFeedLogic(page, limit, currentUserId)

        return combined

    } catch (error: unknown) {
        console.error('Error getting mixed feed:', error instanceof Error ? error.message : error)
        return []
    }
}

// Keep backward compatibility
export const getFeedVideos = getMixedFeed
