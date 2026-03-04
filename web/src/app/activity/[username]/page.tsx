import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ActivityTabs } from '@/components/activity/ActivityTabs'
import { ProfileHeader } from '@/components/profile/ProfileHeader'

export default async function UserActivityPage(props: {
    params: Promise<{ username: string }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await props.params
    const searchParams = await props.searchParams

    const tabParam = typeof searchParams.tab === 'string' ? searchParams.tab.toUpperCase() : 'SALES'
    const initialTab = ['SALES', 'REQUESTS'].includes(tabParam)
        ? (tabParam as 'SALES' | 'REQUESTS')
        : 'SALES'

    const paramId = params.username

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(paramId)

    let user = null
    if (isUUID) {
        user = await db.user.findUnique({
            where: { id: paramId },
            select: { id: true, name: true, username: true, type: true, avatarUrl: true, bio: true, shopCategory: true, isVerified: true, reputationScore: true, createdAt: true, stories: true }
        })
    }
    if (!user) {
        user = await db.user.findUnique({
            where: { username: paramId.toLowerCase() },
            select: { id: true, name: true, username: true, type: true, avatarUrl: true, bio: true, shopCategory: true, isVerified: true, reputationScore: true, createdAt: true, stories: true }
        })
    }

    if (!user) return notFound()

    const [products, requests, interactionStats, postsCount] = await Promise.all([
        db.listing.findMany({
            where: { sellerId: user.id, type: 'PRODUCT' },
            orderBy: { createdAt: 'desc' },
            take: 12,
            select: { id: true, title: true, price: true, images: true }
        }),
        db.listing.findMany({
            where: { sellerId: user.id, type: 'REQUEST' },
            orderBy: { createdAt: 'desc' },
            take: 12,
            select: { id: true, title: true, price: true, images: true }
        }),
        db.interaction.groupBy({
            by: ['type'],
            where: { targetUserId: user.id, type: { in: ['LIKE', 'LOVE'] } },
            _count: true
        }),
        db.socialPost.count({ where: { userId: user.id } })
    ])

    const likesCount = interactionStats.find(s => s.type === 'LIKE')?._count || 0
    const lovesCount = interactionStats.find(s => s.type === 'LOVE')?._count || 0

    return (
        <main className="min-h-screen relative bg-zinc-950 overflow-hidden text-zinc-100">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950/80 to-black" />
                <div className="living-map absolute inset-0 opacity-40 mix-blend-color-dodge" />
            </div>

            <div className="fixed top-4 right-4 z-50">
                <Link
                    href={`/u/${user.username}`}
                    className="flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full text-sm font-medium hover:bg-white/10 transition-colors"
                >
                    <span className="text-xl">📸</span>
                    <span className="hidden sm:inline">العودة للبروفايل</span>
                </Link>
            </div>

            <div className="relative z-10 container mx-auto max-w-2xl min-h-screen pt-20 pb-32">
                <div className="bg-zinc-900/30 backdrop-blur-3xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10">

                    <ProfileHeader
                        user={{
                            id: user.id,
                            name: user.name,
                            username: user.username,
                            type: user.type as 'INDIVIDUAL' | 'SHOP',
                            avatarUrl: user.avatarUrl,
                            bio: user.bio,
                            shopCategory: user.shopCategory,
                            isVerified: user.isVerified,
                            reputationScore: user.reputationScore,
                            joinDate: user.createdAt
                        }}
                        stats={{
                            likes: likesCount,
                            loves: lovesCount,
                            posts: postsCount + user.stories.length,
                            products: products.length
                        }}
                    />

                    <div className="px-2 sm:px-4 mt-6">
                        <ActivityTabs
                            userId={user.id}
                            initialProducts={products as import('@/types').TabListing[]}
                            initialRequests={requests as import('@/types').TabListing[]}
                            initialTab={initialTab}
                        />
                    </div>
                </div>
            </div>
        </main>
    )
}
