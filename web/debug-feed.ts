import { db } from './src/lib/db';

async function test() {
    try {
        console.log("Fetching User by name...");
        const user = await db.user.findFirst({
            where: { name: { contains: 'mohammed amine', mode: 'insensitive' } }
        });

        if (!user) {
            console.log("User not found!");
            return;
        }

        const posts = await db.socialPost.findMany({
            where: { userId: user.id },
            select: {
                id: true,
                mediaType: true,
                type: true,
                caption: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' }
        });

        console.log(`\nFound ${posts.length} SocialPosts for mohammedamine20.`);
        console.table(posts);

        console.log("\nFetching MapStories...");
        const stories = await db.mapStory.findMany({
            where: { userId: user.id },
            select: {
                id: true,
                mediaType: true,
                expiresAt: true,
                createdAt: true
            }
        });

        console.log(`\nFound ${stories.length} MapStories for mohammedamine20.`);
        console.table(stories);

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await db.$disconnect();
    }
}

test();
