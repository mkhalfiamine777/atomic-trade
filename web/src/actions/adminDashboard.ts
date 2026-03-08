'use server'

import { db } from '@/lib/db'
import { verifyAdmin } from '@/lib/adminGuard'

export async function getDashboardStats() {
    const { authorized, error } = await verifyAdmin()
    if (!authorized) return { error }

    try {
        // Run aggregations concurrently for speed
        const [
            totalUsers,
            totalShops,
            verifiedUsers,
            totalProducts,
            totalRequests,
            totalStories,
            totalPosts,
            avgReputation,
            basicSubs,
            premiumSubs
        ] = await Promise.all([
            db.user.count({ where: { type: 'INDIVIDUAL' } }),
            db.user.count({ where: { type: 'SHOP' } }),
            db.user.count({ where: { isVerified: true } }),
            db.listing.count({ where: { type: 'PRODUCT' } }),
            db.listing.count({ where: { type: 'REQUEST' } }),
            db.mapStory.count(),
            db.socialPost.count(),
            db.user.aggregate({ _avg: { reputationScore: true } }),
            db.user.count({ where: { subscription: 'BASIC' } }),
            db.user.count({ where: { subscription: 'PREMIUM' } })
        ])

        return {
            success: true,
            stats: {
                users: {
                    individuals: totalUsers,
                    shops: totalShops,
                    total: totalUsers + totalShops,
                    verified: verifiedUsers,
                    avgReputation: Math.round(avgReputation._avg.reputationScore || 0),
                    basicSubs,
                    premiumSubs,
                    totalSubscriptions: basicSubs + premiumSubs
                },
                content: {
                    products: totalProducts,
                    requests: totalRequests,
                    stories: totalStories,
                    posts: totalPosts,
                    totalListings: totalProducts + totalRequests
                }
            }
        }
    } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
        return { error: 'Failed to fetch dashboard stats.' }
    }
}
