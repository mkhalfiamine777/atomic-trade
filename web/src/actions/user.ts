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
            select: { type: true, latitude: true, longitude: true }
        })

        if (!user) return { error: 'User not found' }

        // ⚓ THE ANCHOR RULE (Prevention of Drift): 
        // If the user is a SHOP or COMPANY and already has an established physical location,
        // DO NOT update their coordinates based on the owner's laptop/phone GPS!
        if ((user.type === 'SHOP' || user.type === 'COMPANY') && user.latitude != null && user.longitude != null) {
            return { success: true }
        }

        // 2. Update User Location (Always for INDIVIDUALs or the very first time for SHOPs)
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

export async function completeOnboarding() {
    const userId = (await cookies()).get('user_id')?.value
    if (!userId) return { error: 'Unauthorized' }

    try {
        await db.user.update({
            where: { id: userId },
            data: { hasCompletedOnboarding: true }
        })
        return { success: true }
    } catch (_error) {
        return { error: 'Failed to complete onboarding' }
    }
}
