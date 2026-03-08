import { db } from '@/lib/db'
import type { Prisma } from '@prisma/client'
import type { FeedItemDTO } from '@/actions/feed'

// Type definitions pulled from feed to avoid duplication inside the service
type PostWithRelations = Prisma.SocialPostGetPayload<{
    include: {
        user: { select: { id: true; name: true; avatarUrl: true; type: true; isVerified: true } }
        interactions: { select: { type: true; userId: true } }
    }
}>

type StoryWithUser = Prisma.MapStoryGetPayload<{
    include: {
        user: { select: { id: true; name: true; avatarUrl: true; type: true; isVerified: true } }
    }
}>

type ListingWithSeller = Prisma.ListingGetPayload<{
    include: {
        seller: { select: { id: true; name: true; username: true; avatarUrl: true; type: true; isVerified: true } }
        interactions: { select: { type: true; userId: true } }
    }
}>

/**
 * 🧠 Core Hybrid Feed Algorithm
 * Mixes Social Content (Posts + Stories) with Commerce (Listings + Golden Deals)
 * Ratio: ~7 media : 2-3 listings per page of 10
 */
export async function getMixedFeedLogic(page: number, limit: number, currentUserId?: string): Promise<FeedItemDTO[]> {
    // Distribute feed items across the 3 types (e.g. for limit 10: 4 posts, 3 stories, 3 listings)
    const postCount = Math.ceil(limit * 0.4)
    const storyCount = Math.ceil(limit * 0.3)
    const listingCount = limit - postCount - storyCount

    // Calculate independent skips for each category to avoid index holes
    const postSkip = (page - 1) * postCount
    const storySkip = (page - 1) * storyCount
    const listingSkip = (page - 1) * listingCount

    // 1. Fetch Posts (Video & Image)
    const postsPromise = db.socialPost.findMany({
        take: postCount,
        skip: postSkip,
        where: {
            mediaType: { in: ['VIDEO', 'IMAGE'] }
        },
        orderBy: { createdAt: 'desc' },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    avatarUrl: true,
                    type: true,
                    isVerified: true
                }
            },
            interactions: {
                select: {
                    type: true,
                    userId: true
                }
            }
        }
    })

    // 2. Fetch MapStories (Paginate naturally through all stories)
    const storiesPromise = db.mapStory.findMany({
        take: storyCount,
        skip: storySkip,
        // DISABLED FOR EXPLORE TESTING: where: { expiresAt: { gt: new Date() } },
        orderBy: { createdAt: 'desc' },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    avatarUrl: true,
                    type: true,
                    isVerified: true
                }
            }
        }
    })

    // 3. 🛍️ Fetch Listings (Products & Requests)
    const listingsPromise = db.listing.findMany({
        take: listingCount,
        skip: listingSkip,
        where: {
            images: { not: '' } // Only listings with images
        },
        orderBy: { createdAt: 'desc' },
        include: {
            seller: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                    avatarUrl: true,
                    type: true,
                    isVerified: true
                }
            },
            interactions: {
                select: { type: true, userId: true }
            }
        }
    })

    const [posts, stories, listings] = await Promise.all([postsPromise, storiesPromise, listingsPromise])

    // Map Posts
    const postItems: FeedItemDTO[] = posts.map((post: PostWithRelations) => {
        const likeCount = post.interactions.filter((i: { type: string }) => i.type === 'LIKE').length
        const commentCount = post.interactions.filter((i: { type: string }) => i.type === 'COMMENT').length
        const isLiked = currentUserId ? post.interactions.some((i: { type: string; userId: string }) => i.type === 'LIKE' && i.userId === currentUserId) : false

        return {
            id: post.id,
            type: post.mediaType as 'VIDEO' | 'IMAGE',
            url: post.mediaUrl,
            username: post.user.name || 'مستخدم',
            userAvatar: post.user.avatarUrl || undefined,
            description: post.caption || '',
            likes: likeCount,
            comments: commentCount,
            shares: 0,
            isShop: post.user.type === 'SHOP',
            isLiked: isLiked,
            createdAt: post.createdAt
        }
    })

    // Map Stories
    const storyItems: FeedItemDTO[] = stories.map((story: StoryWithUser) => ({
        id: story.id,
        type: story.mediaType as 'VIDEO' | 'IMAGE',
        url: story.mediaUrl,
        username: story.user.name || 'مستخدم',
        userAvatar: story.user.avatarUrl || undefined,
        description: story.caption || 'قصة',
        likes: 0,
        comments: 0,
        shares: 0,
        isShop: story.user.type === 'SHOP',
        isLiked: false,
        createdAt: story.createdAt,
        expiresAt: story.expiresAt
    }))

    // 🛍️ Map Listings
    const listingItems: FeedItemDTO[] = listings.map((listing: ListingWithSeller) => {
        const imageUrl = listing.images ? listing.images.split(',')[0].trim() : ''
        const likeCount = listing.interactions.filter((i: { type: string }) => i.type === 'LIKE').length
        const isLiked = currentUserId ? listing.interactions.some((i: { type: string; userId: string }) => i.type === 'LIKE' && i.userId === currentUserId) : false

        return {
            id: listing.id,
            type: 'LISTING' as const,
            url: imageUrl,
            username: listing.seller.name || 'بائع',
            userAvatar: listing.seller.avatarUrl || undefined,
            description: listing.description || '',
            likes: likeCount,
            comments: 0,
            shares: 0,
            isShop: listing.seller.type === 'SHOP',
            isLiked: isLiked,
            createdAt: listing.createdAt,

            // Commerce-specific fields
            price: listing.price,
            title: listing.title,
            listingType: listing.type as 'PRODUCT' | 'REQUEST',
            sellerId: listing.seller.id,
            sellerUsername: listing.seller.username || undefined,

            // Crowd Price Drop Fields
            crowdTarget: listing.crowdTarget,
            crowdDiscount: listing.crowdDiscount,

            // Golden Deal logic: ~1 in 15 items becomes a golden deal (random)
            isGoldenDeal: false,
            dealExpiresAt: null
        }
    })

    // 🎰 Golden Deal: Pick ONE random listing and make it a golden deal
    if (listingItems.length > 0 && Math.random() < 0.4) {
        const goldenIndex = Math.floor(Math.random() * listingItems.length)
        listingItems[goldenIndex].isGoldenDeal = true
        listingItems[goldenIndex].dealExpiresAt = new Date(Date.now() + 60 * 1000) // 60 seconds from now
    }

    // 🔀 Smart Interleaving: Insert listings between media items
    const mediaItems = [...postItems, ...storyItems]
    const combined: FeedItemDTO[] = []

    // Shuffle media first (Fisher-Yates)
    for (let i = mediaItems.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [mediaItems[i], mediaItems[j]] = [mediaItems[j], mediaItems[i]]
    }

    // Interleave: every 3-4 media items, insert a listing
    let listingIdx = 0
    for (let i = 0; i < mediaItems.length; i++) {
        combined.push(mediaItems[i])

        // After every 3rd or 4th media item, inject a listing
        if ((i + 1) % 3 === 0 && listingIdx < listingItems.length) {
            combined.push(listingItems[listingIdx])
            listingIdx++
        }
    }

    // Append any remaining listings at the end
    while (listingIdx < listingItems.length) {
        combined.push(listingItems[listingIdx])
        listingIdx++
    }

    return combined
}
