import { db } from '@/lib/db'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { ProfileTabs } from '@/components/profile/ProfileTabs'
import { CreatePostButton } from '@/components/profile/CreatePostButton'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'

export default async function UserProfilePage(props: {
    params: Promise<{ username: string }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    // Next.js 15+ requires awaiting params
    const params = await props.params
    const searchParams = await props.searchParams

    // The Profile page is now strictly for MEDIA. Tab parsing for SALES/REQUESTS is removed.
    // The activity page handles commerce.
    const initialTabStr = typeof searchParams.tab === 'string' ? searchParams.tab.toUpperCase() : undefined
    const initialTab = ['VIDEOS', 'STORIES', 'IMAGES'].includes(initialTabStr || '')
        ? (initialTabStr as 'VIDEOS' | 'STORIES' | 'IMAGES')
        : undefined

    // 1. Resolve User (Smart ID/Username Resolution) - Decode for Arabic URLs
    const paramId = decodeURIComponent(params.username) // Can be UUID or Username

    // Check if it's a UUID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(paramId)

    let user = null

    if (isUUID) {
        user = await db.user.findUnique({
            where: { id: paramId },
            select: {
                id: true,
                name: true,
                username: true,
                type: true,
                avatarUrl: true,
                bio: true,
                shopCategory: true,
                isVerified: true,
                reputationScore: true,
                createdAt: true,
                stories: { select: { id: true, mediaUrl: true, mediaType: true, caption: true } } // P-1: Only needed fields
            }
        })
    }

    // If not UUID or not found by ID, try finding by username
    if (!user) {
        user = await db.user.findUnique({
            where: { username: paramId.toLowerCase() }, // Case insensitive search
            select: {
                id: true,
                name: true,
                username: true,
                type: true,
                avatarUrl: true,
                bio: true,
                shopCategory: true,
                isVerified: true,
                reputationScore: true,
                createdAt: true,
                stories: { select: { id: true, mediaUrl: true, mediaType: true, caption: true } } // P-1: Only needed fields
            }
        })
    }

    if (!user) {
        return notFound()
    }

    // Parallel Fetching for Initial Content (Limit 12 for Pagination)
    const [videos, images, productsCount, postsCount, interactionStats] = await Promise.all([
        db.socialPost.findMany({
            where: { userId: user.id, mediaType: 'VIDEO' },
            orderBy: { createdAt: 'desc' },
            take: 12,
            select: { id: true, mediaUrl: true, mediaType: true, caption: true }
        }),
        db.socialPost.findMany({
            where: { userId: user.id, mediaType: 'IMAGE' },
            orderBy: { createdAt: 'desc' },
            take: 12,
            select: { id: true, mediaUrl: true, mediaType: true, caption: true }
        }),
        db.listing.count({ where: { sellerId: user.id, type: 'PRODUCT' } }),
        db.socialPost.count({ where: { userId: user.id } }),
        db.interaction.groupBy({
            by: ['type'],
            where: {
                targetUserId: user.id,
                type: { in: ['LIKE', 'LOVE'] }
            },
            _count: true
        })
    ])

    const likesCount = interactionStats.find(s => s.type === 'LIKE')?._count || 0
    const lovesCount = interactionStats.find(s => s.type === 'LOVE')?._count || 0

    // ... preparing data arrays ...
    const mappedStories = user.stories.map(s => ({
        id: s.id,
        mediaUrl: s.mediaUrl,
        mediaType: s.mediaType as 'IMAGE' | 'VIDEO',
        caption: s.caption
    }))

    // 3. Auth Check (For "Create Post" permission)
    const currentUserId = (await cookies()).get('user_id')?.value
    const isOwner = currentUserId === user.id

    return (
        <main className="min-h-screen relative bg-zinc-950 overflow-hidden text-zinc-100">
            {/* 1. Global Animated Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950/80 to-black" />
                <div className="living-map absolute inset-0 opacity-40 mix-blend-color-dodge" />
            </div>

            {/* 2. Floating Navigation (Back to Map) */}
            <div className="fixed top-4 right-4 z-50">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full text-sm font-medium hover:bg-white/10 transition-colors"
                >
                    <span className="text-xl">🗺️</span>
                    <span className="hidden sm:inline">الخريطة</span>
                </Link>
            </div>

            {/* 3. Main Content Container (Glassmorphism) */}
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
                            posts: postsCount + mappedStories.length,
                            products: productsCount
                        }}
                    />

                    <div className="flex flex-col gap-6 px-2 sm:px-4">
                        {/* Commerce Link Button */}
                        <div className="flex justify-center w-full mt-2">
                            <Link
                                href={`/activity/${user.username}`}
                                className="w-full flex items-center justify-center gap-2 bg-zinc-800/50 hover:bg-zinc-800 border border-white/10 py-3 rounded-2xl transition-colors font-medium text-amber-500 shadow-md"
                            >
                                <span className="text-xl">🛍️</span>
                                زيارة المتجر والعناصر المعروضة
                            </Link>
                        </div>

                        <ProfileTabs
                            userId={user.id}
                            initialVideos={videos as import('@/types').TabPost[]}
                            initialImages={images as import('@/types').TabPost[]}
                            initialStories={mappedStories}
                            initialTab={initialTab}
                        />
                    </div>
                </div>
            </div>

            {/* 4. Floating Action Button (Only for Owner) */}
            {isOwner && (
                <div className="fixed bottom-24 left-4 z-40">
                    <CreatePostButton userId={user.id} />
                </div>
            )}

            {/* 5. Bottom Navigation Spacing/Placeholder if needed */}
        </main>
    )
}
