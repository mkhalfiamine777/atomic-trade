import { db } from '@/lib/db'

export async function getOrCreateConversation(
    user1Id: string,
    user2Id: string,
    listingId: string | null = null
) {
    if (user1Id === user2Id) {
        throw new Error('Cannot chat with yourself')
    }

    // 1. Check if conversation already exists with specific Listing ID (or null)
    // We strictly match listingId to separate "General DMs" from "Listing Inquiries"
    const existingConversation = await db.conversation.findFirst({
        where: {
            AND: [
                {
                    OR: [
                        { participant1Id: user1Id, participant2Id: user2Id },
                        { participant1Id: user2Id, participant2Id: user1Id }
                    ]
                },
                {
                    listingId: listingId
                }
            ]
        }
    })

    if (existingConversation) {
        return { conversationId: existingConversation.id, isNew: false }
    }

    // 2. Create new conversation
    const newConversation = await db.conversation.create({
        data: {
            participant1Id: user1Id,
            participant2Id: user2Id,
            listingId: listingId
        }
    })

    return { conversationId: newConversation.id, isNew: true }
}
