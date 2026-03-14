import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const postsCount = await prisma.socialPost.count()
    const storiesCount = await prisma.mapStory.count()
    const listingsCount = await prisma.listing.count()

    console.log({
        posts: postsCount,
        stories: storiesCount,
        listings: listingsCount
    })
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
