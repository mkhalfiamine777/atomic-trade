import { MetadataRoute } from 'next'
import { db } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://souqmap.ma'

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1
        },
        {
            url: `${baseUrl}/login`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5
        },
        {
            url: `${baseUrl}/signup`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5
        },
        {
            url: `${baseUrl}/dashboard`,
            lastModified: new Date(),
            changeFrequency: 'hourly',
            priority: 0.9
        }
    ]

    // Dynamic pages: Listings
    try {
        const listings = await db.listing.findMany({
            select: { id: true, createdAt: true },
            take: 1000
        })

        const listingPages: MetadataRoute.Sitemap = listings.map(listing => ({
            url: `${baseUrl}/listing/${listing.id}`,
            lastModified: listing.createdAt,
            changeFrequency: 'weekly' as const,
            priority: 0.7
        }))

        return [...staticPages, ...listingPages]
    } catch {
        return staticPages
    }
}
