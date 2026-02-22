'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

import { getOrCreateConversation } from '@/services/conversationService'

export async function startConversation(listingId: string | null, otherUserId: string) {
    try {
        const cookieStore = await cookies()
        const currentUserId = cookieStore.get('user_id')?.value

        if (!currentUserId) {
            return { error: 'Unauthorized: Please login' }
        }

        // The existing service call `getOrCreateConversation` is already in place.
        // If the instruction "Replace duplication with service call" implies
        // that the logic *after* this call (revalidatePath and return) should
        // be part of a service, or if `getOrCreateConversation` itself is
        // being wrapped/replaced, the new service call was not provided.
        // Assuming the instruction means to keep the existing service call
        // and its immediate follow-up, as no replacement code was given.
        const { conversationId } = await getOrCreateConversation(currentUserId, otherUserId, listingId)

        revalidatePath('/messages')
        return { conversationId }
    } catch (error) {
        console.error('Error starting conversation:', error)
        return { error: 'Failed to start conversation' }
    }
}
