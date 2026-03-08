'use server'

import { cookies } from 'next/headers'
import { db } from '@/lib/db'

/**
 * 🛡️ Admin Guard — Shared admin verification
 * Used by all admin server actions to verify caller is an admin.
 */
export async function verifyAdmin(): Promise<{ authorized: boolean; userId?: string; error?: string }> {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value
    if (!userId) return { authorized: false, error: 'Unauthorized' }

    const user = await db.user.findUnique({ where: { id: userId }, select: { phone: true } })
    if (!user) return { authorized: false, error: 'User not found' }

    const adminPhones = (process.env.ADMIN_PHONES || '').split(',').map(p => p.trim())
    if (!adminPhones.includes(user.phone)) {
        return { authorized: false, error: 'Forbidden: Admin access only' }
    }
    return { authorized: true, userId }
}
