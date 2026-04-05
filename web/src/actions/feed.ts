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
import { unstable_cache } from 'next/cache'

// Wrap the core feed logic with Next.js unstable_cache to drastically reduce Server Response Time
const getCachedMixedFeed = unstable_cache(
    async (page: number, limit: number, currentUserId?: string) => {
        return getMixedFeedLogic(page, limit, currentUserId)
    },
    ['mixed-feed-cache'], // Base cache key
    {
        revalidate: 60, // Cache for 60 seconds to balance freshness and performance
        tags: ['feed']  // Tag for targeted manual revalidation if needed
    }
)

export async function getMixedFeed(page = 1, limit = 10, currentUserId?: string): Promise<FeedItemDTO[]> {
    try {
        // 1. Get cached raw data (deterministic — safe to cache)
        const { postItems, storyItems, listingItems } = await getCachedMixedFeed(page, limit, currentUserId)

        // 2. 🎰 Golden Deal (random — applied per-request, NOT cached)
        if (listingItems.length > 0 && Math.random() < 0.4) {
            const goldenIndex = Math.floor(Math.random() * listingItems.length)
            listingItems[goldenIndex].isGoldenDeal = true
            listingItems[goldenIndex].dealExpiresAt = new Date(Date.now() + 60 * 1000)
        }

        // 3. 🔀 Fisher-Yates Shuffle (random — per-request)
        const mediaItems = [...postItems, ...storyItems]
        for (let i = mediaItems.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [mediaItems[i], mediaItems[j]] = [mediaItems[j], mediaItems[i]]
        }

        // 4. Interleave: every 3 media items, inject a listing
        const combined: FeedItemDTO[] = []
        let listingIdx = 0
        for (let i = 0; i < mediaItems.length; i++) {
            combined.push(mediaItems[i])
            if ((i + 1) % 3 === 0 && listingIdx < listingItems.length) {
                combined.push(listingItems[listingIdx])
                listingIdx++
            }
        }
        while (listingIdx < listingItems.length) {
            combined.push(listingItems[listingIdx])
            listingIdx++
        }

        return combined
    } catch (error: unknown) {
        console.error('Error getting mixed feed:', error instanceof Error ? error.message : error)
        return []
    }
}
