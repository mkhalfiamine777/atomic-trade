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
import { db } from '@/lib/db'
import * as Sentry from '@sentry/nextjs'

// P0-5 FIX: Cache is now USER-INDEPENDENT — no currentUserId in key.
// This prevents cache key explosion (100k users → 100k cache entries → ~500MB).
const getCachedRawFeed = unstable_cache(
    async (page: number, limit: number, filterType: 'SOCIAL' | 'COMMERCE' = 'SOCIAL') => {
        return getMixedFeedLogic(page, limit, filterType)
    },
    ['mixed-feed-cache'], // Base cache key (Next.js auto-appends args hash)
    {
        revalidate: 60, // Cache for 60 seconds to balance freshness and performance
        tags: ['feed']  // Tag for targeted manual revalidation if needed
    }
)

/**
 * P0-5 FIX: Fetches only the likes relevant to the current page's items.
 * This avoids a heavy unbounded query (power user with 10k likes → slow).
 * Instead: query WHERE postId IN [...pageItemIds] — always small and fast.
 */
async function getLikedIdsForFeedItems(
    userId: string,
    itemIds: { postIds: string[]; listingIds: string[] }
): Promise<Set<string>> {
    if (itemIds.postIds.length === 0 && itemIds.listingIds.length === 0) return new Set()

    const orConditions = []
    if (itemIds.postIds.length > 0) {
        orConditions.push({ postId: { in: itemIds.postIds } })
    }
    if (itemIds.listingIds.length > 0) {
        orConditions.push({ listingId: { in: itemIds.listingIds } })
    }

    const likes = await db.interaction.findMany({
        where: {
            userId,
            type: 'LIKE',
            OR: orConditions
        },
        select: { postId: true, listingId: true }
    })

    return new Set(
        [...likes.map(l => l.postId), ...likes.map(l => l.listingId)]
            .filter(Boolean) as string[]
    )
}

export async function getMixedFeed(page = 1, limit = 10, currentUserId?: string, filterType: 'SOCIAL' | 'COMMERCE' = 'SOCIAL'): Promise<FeedItemDTO[]> {
    try {
        // 1. Get cached raw data (user-independent — no userId in cache key)
        const { postItems, storyItems, listingItems } = await getCachedRawFeed(page, limit, filterType)

        // 2. P0-5 FIX: Apply isLiked per-user AFTER cache retrieval
        if (currentUserId) {
            const postIds = postItems.map(p => p.id)
            const listingIds = listingItems.map(l => l.id)
            const likedIds = await getLikedIdsForFeedItems(currentUserId, { postIds, listingIds })

            for (const item of postItems) {
                item.isLiked = likedIds.has(item.id)
            }
            for (const item of listingItems) {
                item.isLiked = likedIds.has(item.id)
            }
        }

        // 3. 🎰 Golden Deal (random — applied per-request, NOT cached)
        if (listingItems.length > 0 && Math.random() < 0.4) {
            const goldenIndex = Math.floor(Math.random() * listingItems.length)
            listingItems[goldenIndex].isGoldenDeal = true
            listingItems[goldenIndex].dealExpiresAt = new Date(Date.now() + 60 * 1000)
        }

        if (filterType === 'COMMERCE') {
            // For commerce, we just interleave a few social media items among the listings
            const mediaItems = [...postItems, ...storyItems]
            const combined: FeedItemDTO[] = []
            let mediaIdx = 0
            
            for (let i = 0; i < listingItems.length; i++) {
                combined.push(listingItems[i])
                // Insert 1 social post every 5 listings to keep it not entirely dry
                if ((i + 1) % 5 === 0 && mediaIdx < mediaItems.length) {
                    combined.push(mediaItems[mediaIdx])
                    mediaIdx++
                }
            }
            while (mediaIdx < mediaItems.length) {
                combined.push(mediaItems[mediaIdx])
                mediaIdx++
            }
            return combined
        } else {
            // SOCIAL Mode: 🔀 Fisher-Yates Shuffle media items
            const mediaItems = [...postItems, ...storyItems]
            for (let i = mediaItems.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [mediaItems[i], mediaItems[j]] = [mediaItems[j], mediaItems[i]]
            }

            // 4. Interleave: inject a listing every random 4 to 6 media items
            const combined: FeedItemDTO[] = []
            let listingIdx = 0
            let nextListingSpacing = Math.floor(Math.random() * 3) + 4 // random 4, 5, or 6
            let currentSpacingCount = 0

            for (let i = 0; i < mediaItems.length; i++) {
                combined.push(mediaItems[i])
                currentSpacingCount++

                if (currentSpacingCount >= nextListingSpacing && listingIdx < listingItems.length) {
                    combined.push(listingItems[listingIdx])
                    listingIdx++
                    currentSpacingCount = 0
                    nextListingSpacing = Math.floor(Math.random() * 3) + 4 // generate new spacing for next listing
                }
            }
            
            // Append any remaining listings
            while (listingIdx < listingItems.length) {
                combined.push(listingItems[listingIdx])
                listingIdx++
            }

            return combined
        }

    } catch (error: unknown) {
        Sentry.captureException(error, { tags: { action: 'getMixedFeed' } })
        console.error('Error getting mixed feed:', error instanceof Error ? error.message : error)
        return []
    }
}
