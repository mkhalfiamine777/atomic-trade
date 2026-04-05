'use server'

import { db } from '@/lib/db'

export type ContentType = 'VIDEOS' | 'IMAGES' | 'STORIES' | 'SALES' | 'REQUESTS'

export async function getProfileContent(userId: string, type: ContentType, page: number = 1, limit: number = 12) {
    try {
        const skip = (page - 1) * limit

        if (type === 'VIDEOS' || type === 'IMAGES') {
            const filterMediaType = type === 'VIDEOS' ? 'VIDEO' : 'IMAGE'

            const posts = await db.socialPost.findMany({
                where: { userId, mediaType: filterMediaType },
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

            const total = await db.socialPost.count({ where: { userId, mediaType: filterMediaType } })
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
        else if (type === 'STORIES') {
            const stories = await db.mapStory.findMany({
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
                }
            })

            const total = await db.mapStory.count({ where: { userId } })
            const hasMore = skip + stories.length < total

            return {
                success: true,
                data: stories.map(s => ({
                    id: s.id,
                    mediaUrl: s.mediaUrl,
                    mediaType: s.mediaType,
                    caption: s.caption,
                    type: 'STORY',
                })),
                hasMore
            }
        }

        return { success: false, error: 'Invalid type' }

    } catch (error) {
        console.error('Error fetching profile content:', error)
        return { success: false, error: 'Failed to fetch content' }
    }
}
