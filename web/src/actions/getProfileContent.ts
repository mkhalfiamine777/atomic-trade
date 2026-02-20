'use server'

import { db } from '@/lib/db'

export type ContentType = 'MEDIA' | 'SALES' | 'REQUESTS'

export async function getProfileContent(userId: string, type: ContentType, page: number = 1, limit: number = 12) {
    try {
        const skip = (page - 1) * limit

        if (type === 'MEDIA') {
            // Fetch Mixed Media (Stories + Posts)
            // Note: Pagination for mixed types is tricky. 
            // For simplicity in this iteration, we will just fetch Posts here. 
            // Stories are usually few and recent, so we might keep them separate or just fetch posts.
            // Let's fetch SocialPosts specifically for infinite scroll.

            const posts = await db.socialPost.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: skip,
                select: {
                    id: true,
                    mediaUrl: true,
                    mediaType: true,
                    caption: true,
                    createdAt: true,
                    _count: {
                        select: {
                            interactions: true
                        }
                    }
                }
            })

            const total = await db.socialPost.count({ where: { userId } })
            const hasMore = skip + posts.length < total

            return {
                success: true,
                data: posts.map(p => ({
                    id: p.id,
                    mediaUrl: p.mediaUrl,
                    mediaType: p.mediaType,
                    caption: p.caption,
                    type: p.mediaType,
                })),
                hasMore
            }
        }

        else if (type === 'SALES' || type === 'REQUESTS') {
            const listingType = type === 'SALES' ? 'PRODUCT' : 'REQUEST'

            const listings = await db.listing.findMany({
                where: {
                    sellerId: userId,
                    type: listingType
                },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: skip,
                select: {
                    id: true,
                    title: true,
                    price: true,
                    images: true,
                    createdAt: true
                }
            })

            const total = await db.listing.count({
                where: { sellerId: userId, type: listingType }
            })
            const hasMore = skip + listings.length < total

            return {
                success: true,
                data: listings.map(l => ({ ...l, type: 'LISTING' })),
                hasMore
            }
        }

        return { success: false, error: 'Invalid type' }

    } catch (error) {
        console.error('Error fetching profile content:', error)
        return { success: false, error: 'Failed to fetch content' }
    }
}
