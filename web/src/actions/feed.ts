'use server'

import { revalidatePath } from 'next/cache'

// Define the shape of a Video Post based on Prisma schema + Frontend needs
export type VideoPostDTO = {
    id: string
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
    createdAt: Date
}

// MOCK DATA for Safe Testing

import { db } from '@/lib/db'

export async function getFeedVideos(page = 1, limit = 10): Promise<VideoPostDTO[]> {
    try {
        const skip = (page - 1) * limit

        const posts = await db.socialPost.findMany({
            take: limit,
            skip: skip,
            where: {
                mediaType: 'VIDEO'
            },
            orderBy: { createdAt: 'desc' },
            include: {
                user: true,
                _count: {
                    select: {
                        interactions: {
                            where: { type: 'LIKE' }
                        }
                    }
                },
                interactions: {
                    where: { type: 'COMMENT' },
                    select: { id: true }
                }
            }
        })

        const videoPosts: VideoPostDTO[] = posts.map(post => {
            // Calculate counts manually or via refined queries in future
            // For now, mapping what we have. Note: Schema doesn't have direct 'shares' count yet.
            const likeCount = post._count.interactions // This gives total likes if we filtered _count above
            const commentCount = post.interactions.length // Counting loaded comments (might need optimization)

            return {
                id: post.id,
                url: post.mediaUrl,
                poster: undefined, // Generate or store thumbnail separately
                username: post.user.name || 'مستخدم',
                userAvatar: post.user.avatarUrl || undefined,
                description: post.caption || '',
                likes: likeCount,
                comments: commentCount,
                shares: 0, // Not tracked in current schema
                location: undefined, // Not in SocialPost schema
                isShop: post.user.type === 'SHOP',
                createdAt: post.createdAt
            }
        })

        return videoPosts

    } catch (error) {
        console.error('Error getting feed videos:', error)
        return []
    }
}
