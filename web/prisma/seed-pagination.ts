import { PrismaClient, MediaType, ListingType } from '@prisma/client'

const prisma = new PrismaClient()

// Unique identifier to track and clean seed data
const SEED_TAG = '[SEED-PAGINATION]'

async function main() {
    const args = process.argv.slice(2)
    const isCleanMode = args.includes('--clean')

    const user = await prisma.user.findFirst({
        orderBy: { createdAt: 'desc' }
    })

    if (!user) {
        console.error('❌ No user found. Please create an account first.')
        return
    }

    if (isCleanMode) {
        console.log('🧹 Cleaning up seed data...')

        // Delete Posts
        const deletedPosts = await prisma.socialPost.deleteMany({
            where: {
                userId: user.id,
                caption: { contains: SEED_TAG }
            }
        })
        console.log(`🗑️ Deleted ${deletedPosts.count} seed posts.`)

        // Delete Products
        const deletedListings = await prisma.listing.deleteMany({
            where: {
                sellerId: user.id,
                description: { contains: SEED_TAG }
            }
        })
        console.log(`🗑️ Deleted ${deletedListings.count} seed listings.`)

        console.log('✨ Cleanup complete!')
        return
    }

    // --- SEED MODE ---
    console.log(`🌱 Seeding data for user: ${user.name}...`)

    // Create 50 Social Posts
    console.log('📸 Creating 50 Social Posts...')
    const postsData = Array.from({ length: 50 }).map((_, i) => ({
        userId: user.id,
        mediaUrl: `https://picsum.photos/seed/post_${Date.now()}_${i}/600/600`,
        mediaType: MediaType.IMAGE,
        caption: `${SEED_TAG} منشور رقم ${i + 1}`,
    }))

    await prisma.socialPost.createMany({ data: postsData })

    // Create 50 Products
    console.log('🛍️ Creating 50 Products...')
    const productsData = Array.from({ length: 50 }).map((_, i) => ({
        sellerId: user.id,
        title: `منتج تجريبي ${i + 1}`,
        description: `${SEED_TAG} وصف المنتج رقم ${i + 1}`,
        price: (i + 1) * 50 + 9,
        images: `https://picsum.photos/seed/prod_${Date.now()}_${i}/600/600`,
        type: ListingType.PRODUCT,
        latitude: 33.5731, // Default coordinates (Casablanca)
        longitude: -7.5898,
        category: 'GENERAL',
    }))

    await prisma.listing.createMany({ data: productsData })

    console.log('✅ Seeding completed! (Run with --clean to remove)')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
