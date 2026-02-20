'use server'

import { db } from '@/lib/db'
import { cookies } from 'next/headers'

// --- Toggle Follow/Unfollow ---
export async function toggleFollow(targetUserId: string) {
    try {
        const currentUserId = (await cookies()).get('user_id')?.value
        if (!currentUserId) return { success: false, error: 'غير مسجل الدخول' }
        if (currentUserId === targetUserId) return { success: false, error: 'لا يمكنك متابعة نفسك' }

        // Check if already following
        const existingFollow = await db.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: currentUserId,
                    followingId: targetUserId
                }
            }
        })

        if (existingFollow) {
            // Unfollow
            await db.follow.delete({ where: { id: existingFollow.id } })
            return { success: true, isFollowing: false }
        } else {
            // Follow
            await db.follow.create({
                data: {
                    followerId: currentUserId,
                    followingId: targetUserId
                }
            })
            return { success: true, isFollowing: true }
        }
    } catch (error: unknown) {
        console.error('Error toggling follow:', error)
        return { success: false, error: 'فشل في تنفيذ العملية' }
    }
}

// --- Check Follow Status ---
export async function getFollowStatus(targetUserId: string) {
    try {
        const currentUserId = (await cookies()).get('user_id')?.value
        if (!currentUserId) return { isFollowing: false }

        const follow = await db.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: currentUserId,
                    followingId: targetUserId
                }
            }
        })

        return { isFollowing: !!follow }
    } catch (error: unknown) {
        console.error('Error checking follow status:', error)
        return { isFollowing: false }
    }
}

// --- Get Follow Counts ---
export async function getFollowCounts(userId: string) {
    try {
        const [followers, following] = await Promise.all([
            db.follow.count({ where: { followingId: userId } }),
            db.follow.count({ where: { followerId: userId } })
        ])

        return { followers, following }
    } catch (error: unknown) {
        console.error('Error getting follow counts:', error)
        return { followers: 0, following: 0 }
    }
}
