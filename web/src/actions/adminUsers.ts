'use server'

import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

// 🛡️ Admin Guard: verify caller is an admin
async function verifyAdmin(): Promise<{ authorized: boolean; error?: string }> {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value
    if (!userId) return { authorized: false, error: 'Unauthorized' }

    const user = await db.user.findUnique({ where: { id: userId }, select: { phone: true } })
    if (!user) return { authorized: false, error: 'User not found' }

    const adminPhones = (process.env.ADMIN_PHONES || '').split(',').map(p => p.trim())
    if (!adminPhones.includes(user.phone)) {
        return { authorized: false, error: 'Forbidden: Admin access only' }
    }
    return { authorized: true }
}

// Fetch all users with basic stats
export async function getAllUsers() {
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
