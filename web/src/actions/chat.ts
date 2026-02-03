'use server'

import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

// Start a conversation for a specific listing between current user and seller/buyer
export async function startConversation(listingId: string, otherUserId: string) {
    const userId = (await cookies()).get('user_id')?.value
    if (!userId) return { error: 'Unauthorized' }

    try {
        // Check if conversation already exists for this listing and these two users
        const existing = await db.conversation.findFirst({
            where: {
                listingId,
                OR: [
                    { participant1Id: userId, participant2Id: otherUserId },
                    { participant1Id: otherUserId, participant2Id: userId }
                ]
            }
        })

        if (existing) {
            return { conversationId: existing.id }
        }

        // Create new
        const newConv = await db.conversation.create({
            data: {
                listingId,
                participant1Id: userId,
                participant2Id: otherUserId
            }
        })

        return { conversationId: newConv.id }
    } catch (error) {
        console.error('Start Chat Error:', error)
        return { error: 'Failed to start chat' }
    }
}

export async function sendMessage(conversationId: string, content: string) {
    const userId = (await cookies()).get('user_id')?.value
    if (!userId) return { error: 'Unauthorized' }

    if (!content.trim()) return { error: 'Empty message' }

    try {
        await db.message.create({
            data: {
                conversationId,
                senderId: userId,
                content
            }
        })
        revalidatePath(`/dashboard`)
        return { success: true }
    } catch (_error) {
        return { error: 'Failed to send' }
    }
}

export async function getConversationMessages(conversationId: string) {
    try {
        const messages = await db.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' },
            include: { sender: { select: { name: true, id: true } } }
        })
        return messages
    } catch (_error) {
        return []
    }
}
