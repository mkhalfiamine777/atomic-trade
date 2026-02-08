import { db } from '@/lib/db'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { ProfileTabs } from '@/components/profile/ProfileTabs'
import { CreatePostButton } from '@/components/profile/CreatePostButton'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'

export default async function UserProfilePage(props: { params: Promise<{ username: string }> }) {
    // Next.js 15+ requires awaiting params
    const params = await props.params

    // 1. Resolve User
    // We pass UUID in URL for robustness, display name nicely in UI.
    const userId = params.username // Treating this as ID for now for technical stability

    const user = await db.user.findUnique({
        where: { id: userId },
        include: {
            stories: true,
            listings: true,
            posts: true
            // interactionsReceived: true // REMOVED: Inefficient for large data
        }
    })

    if (!user) {
        // Fallback: Try fuzzy search by name? (Risky for conflicts)
        return notFound()
    }

    // Calculate Counts Efficiently
    const interactionStats = await db.interaction.groupBy({
        by: ['type'],
        where: {
            targetUserId: user.id,
            type: { in: ['LIKE', 'LOVE'] }
        },
        _count: true
    })

    const likesCount = interactionStats.find(s => s.type === 'LIKE')?._count || 0
    const lovesCount = interactionStats.find(s => s.type === 'LOVE')?._count || 0

    // 2. Prepare Activity Stream
    // Combine Stories, Listings, and SocialPosts into one timeline
    // 2. Prepare Data for Tabs
    const stories = user.stories.map(s => ({
        id: s.id,
        mediaUrl: s.mediaUrl,
        mediaType: s.mediaType,
        caption: s.caption
    }))

    const posts = user.posts.map(p => ({
        id: p.id,
        mediaUrl: p.mediaUrl,
        mediaType: p.mediaType,
        caption: p.caption
    }))

    const products = user.listings.filter(l => l.type === 'PRODUCT').map(l => ({
        id: l.id,
        title: l.title,
        price: l.price,
        images: l.images
    }))

    const requests = user.listings.filter(l => l.type === 'REQUEST').map(l => ({
        id: l.id,
        title: l.title,
        price: l.price,
        images: l.images
    }))

    // 3. Auth Check (For "Create Post" permission)
    const currentUserId = (await cookies()).get('user_id')?.value
    const isOwner = currentUserId === user.id

    return (
        <main className="min-h-screen bg-gx-bg pb-20 relative">
            <ProfileHeader
                user={{
                    id: user.id,
                    name: user.name,
                    type: user.type,
                    avatarUrl: user.avatarUrl,
                    isVerified: user.isVerified,
                    reputationScore: user.reputationScore,
                    joinDate: user.createdAt
                }}
                stats={{
                    likes: likesCount,
                    loves: lovesCount
                }}
                currentUserId={currentUserId}
            />

            <div className="container mx-auto max-w-md mt-4">
                <ProfileTabs
                    stories={stories}
                    posts={posts}
                    products={products}
                    requests={requests}
                />
            </div>

            {/* Floating Action Button (Only for Owner) */}
            {isOwner && <CreatePostButton userId={user.id} />}
        </main>
    )
}
