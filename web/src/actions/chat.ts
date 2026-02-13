'use server'

import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function startConversation(listingId: string | null, otherUserId: string) {
    try {
        const cookieStore = await cookies()
        const currentUserId = cookieStore.get('user_id')?.value

        if (!currentUserId) {
            return { error: 'Unauthorized: Please login' }
        }

        if (currentUserId === otherUserId) {
            return { error: 'Cannot chat with yourself' }
        }

        // 1. Check if conversation already exists
        // We look for a conversation where:
        // - Participants match (order doesn't matter)
        // - Listing ID matches (if provided) OR it's a direct message (if listingId is null)
        const existingConversation = await db.conversation.findFirst({
            where: {
                OR: [
                    {
                        participant1Id: currentUserId,
                        participant2Id: otherUserId,
                        listingId: listingId
                    },
                    {
                        participant1Id: otherUserId,
                        participant2Id: currentUserId,
                        listingId: listingId
                    }
                ]
            }
        })

        if (existingConversation) {
            return { conversationId: existingConversation.id }
        }

        // 2. Create new conversation
        const newConversation = await db.conversation.create({
            data: {
                participant1Id: currentUserId,
                participant2Id: otherUserId,
                listingId: listingId
            }
        })

        revalidatePath('/messages')
        return { conversationId: newConversation.id }
    } catch (error) {
        console.error('Error starting conversation:', error)
        return { error: 'Failed to start conversation' }
    }
}
