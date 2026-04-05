'use server'

import { cookies } from 'next/headers'
import { db } from '@/lib/db'

export async function updateUserLocation(lat: number, lng: number) {
    const userId = (await cookies()).get('user_id')?.value
    if (!userId) return { error: 'Unauthorized' }

    try {
        // 1. Check User Type First
        const user = await db.user.findUnique({
            where: { id: userId },
            select: { type: true }
        })

        if (!user) return { error: 'User not found' }

        // 2. Update User Location (Always)
        await db.user.update({
            where: { id: userId },
            data: { latitude: lat, longitude: lng }
        })

        // 3. IF INDIVIDUAL: Sync "Merchandise" & "Stories" to follow the user 🚶‍♂️📦
        if (user.type === 'INDIVIDUAL') {
            // Move active (unsold) products AND requests only
            await db.listing.updateMany({
                where: {
                    sellerId: userId,
                    isSold: false,
                    type: { in: ['PRODUCT', 'REQUEST'] }
                },
                data: { latitude: lat, longitude: lng }
            })

            // Move active stories
            await db.mapStory.updateMany({
                where: {
                    userId: userId,
                    expiresAt: { gt: new Date() }
                },
                data: { latitude: lat, longitude: lng }
            })
        }

        return { success: true }
    } catch (_error) {
        // Silent fail is favored for background tracking to avoid spamming logs
        return { error: 'Failed to update location' }
    }
}
