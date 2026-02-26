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

/**
 * Core business logic for mixing Posts and Stories and shuffling them
 */
export async function getMixedFeedLogic(page: number, limit: number, currentUserId?: string): Promise<FeedItemDTO[]> {
    const skip = (page - 1) * limit

    // 1. Fetch Posts (Video & Image)
    const postsPromise = db.socialPost.findMany({
        take: limit * 2,
        skip: skip,
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

    // 2. Fetch MapStories (Only on first page)
    const storiesPromise = page === 1 ? db.mapStory.findMany({
        take: 5,
        where: {
            expiresAt: { gt: new Date() }
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
            }
        }
    }) : Promise.resolve([] as StoryWithUser[])

    const [posts, stories] = await Promise.all([postsPromise, storiesPromise])

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
        type: (story.mediaType === 'VIDEO' ? 'VIDEO' : 'IMAGE') as 'VIDEO' | 'IMAGE',
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

    // Combine and Shuffle (Fisher-Yates for true randomness)
    const combined = [...postItems, ...storyItems]
    for (let i = combined.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [combined[i], combined[j]] = [combined[j], combined[i]]
    }

    return combined.slice(0, limit)
}
