'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { verifyAdmin } from '@/lib/adminGuard'

// Fetch all users with basic stats
export async function getAllUsers() {
    const { authorized, error } = await verifyAdmin()
    if (!authorized) return { error }

    try {
        const users = await db.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                username: true,
                phone: true,
                type: true,
                shopCategory: true,
                isVerified: true,
                reputationScore: true,
                createdAt: true,
                _count: {
                    select: { listings: true }
                }
            }
        });
        return { success: true, users };
    } catch (error) {
        console.error('Failed to fetch users:', error);
        return { error: 'Failed to fetch users.' };
    }
}

// Toggle Verification Status (The Blue Tick ✅)
export async function toggleUserVerification(userId: string, currentStatus: boolean) {
    const { authorized, error } = await verifyAdmin()
    if (!authorized) return { error }

    try {
        await db.user.update({
            where: { id: userId },
            data: { isVerified: !currentStatus }
        })
        revalidatePath('/admin/users')
        return { success: true }
    } catch (error) {
        console.error('Failed to toggle verification:', error);
        return { error: 'Failed to update verification status.' };
    }
}

// Reset Reputation Score (A form of warning/punishment)
export async function resetReputation(userId: string) {
    const { authorized, error } = await verifyAdmin()
    if (!authorized) return { error }

    try {
        await db.user.update({
            where: { id: userId },
            data: { reputationScore: 50 } // Reset to a low warning state, not 100
        })
        revalidatePath('/admin/users')
        return { success: true }
    } catch (error) {
        console.error('Failed to reset reputation:', error);
        return { error: 'Failed to reset reputation.' };
    }
}
