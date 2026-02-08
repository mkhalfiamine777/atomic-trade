'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'

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
    isLiked: boolean
    createdAt: Date
}

export async function getFeedVideos(page = 1, limit = 10, currentUserId?: string): Promise<VideoPostDTO[]> {
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
                interactions: {
                    select: {
                        type: true,
                        userId: true
                    }
                }
            }
        })

        const videoPosts: VideoPostDTO[] = posts.map(post => {
            const likeCount = post.interactions.filter(i => i.type === 'LIKE').length
            const commentCount = post.interactions.filter(i => i.type === 'COMMENT').length
            const isLiked = currentUserId ? post.interactions.some(i => i.type === 'LIKE' && i.userId === currentUserId) : false

            return {
                id: post.id,
                url: post.mediaUrl,
                poster: undefined,
                username: post.user.name || 'مستخدم',
                userAvatar: post.user.avatarUrl || undefined,
                description: post.caption || '',
                likes: likeCount,
                comments: commentCount,
                shares: 0,
                location: undefined,
                isShop: post.user.type === 'SHOP',
                isLiked: isLiked,
                createdAt: post.createdAt
            }
        })

        return videoPosts

    } catch (error) {
        console.error('Error getting feed videos:', error)
        return []
    }
}
