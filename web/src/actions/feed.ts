'use server'

// T-2 FIX: FeedItemDTO is defined here and exported.
// Prisma helper types (PostWithRelations, StoryWithUser, ListingWithSeller)
// are defined ONLY in @/services/feedService.ts to avoid duplication.

// Define the shape of a Feed Item (Video, Image, Story, or Listing)
export type FeedItemDTO = {
    id: string
    type: 'VIDEO' | 'IMAGE' | 'STORY' | 'LISTING'
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

    // 🛍️ Commerce Fields (Listing only)
    price?: number | null
    title?: string | null
    listingType?: 'PRODUCT' | 'REQUEST'
    sellerId?: string
    sellerUsername?: string

    // 📉 Crowd Price Drop Fields
    crowdTarget?: number | null
    crowdDiscount?: number | null

    // 🎰 Golden Deal Fields
    isGoldenDeal?: boolean
    dealExpiresAt?: Date | null
}

// P-2 FIX: Static import instead of dynamic for better tree-shaking
import { getMixedFeedLogic } from '@/services/feedService'

export async function getMixedFeed(page = 1, limit = 10, currentUserId?: string): Promise<FeedItemDTO[]> {
    try {
        const combined = await getMixedFeedLogic(page, limit, currentUserId)
        return combined
    } catch (error: unknown) {
        console.error('Error getting mixed feed:', error instanceof Error ? error.message : error)
        return []
    }
}

// Keep backward compatibility
export const getFeedVideos = getMixedFeed
