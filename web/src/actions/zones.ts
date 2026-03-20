'use server'

import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

/**
 * Handles purchasing a new Zone via its Geohash.
 * Checks if the zone is available, verifying user balance, and creates an atomic transaction to assign ownership.
 *
 * @param geohash - The 5-character geohash string representing the zone.
 * @returns Object with `success: true` and the new `zone`, or `{ error: string }`.
 */
export async function purchaseZone(geohash: string) {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
        return { error: 'يجب عليك تسجيل الدخول أولاً' }
    }

    const ZONE_COST = 500 // coins

    try {
        // 1 & 2 & 3: Atomic Transaction to prevent TOCTOU race conditions
        const result = await db.$transaction(async (tx) => {
            const existingZone = await tx.zoneMaster.findUnique({
                where: { geoHash: geohash }
            })

            if (existingZone) {
                return { error: 'عذراً، هذه المنطقة مملوكة مسبقاً لسيد آخر!' }
            }

            const user = await tx.user.findUnique({
                where: { id: userId },
                select: { coins: true }
            })

            if (!user || user.coins < ZONE_COST) {
                return { error: `رصيدك غير كافي. تحتاج ${ZONE_COST} عملة (لديك ${user?.coins || 0})` }
            }

            const newZone = await tx.zoneMaster.create({
                data: {
                    geoHash: geohash,
                    zoneName: `إقطاعية ${geohash.slice(0, 5)}`,
                    currentLordId: userId,
                    taxRate: 1.5
                }
            })

            await tx.user.update({
                where: { id: userId },
                data: { coins: { decrement: ZONE_COST } }
            })

            return { success: true, zone: newZone }
        })

        if ('error' in result) {
            return { error: result.error }
        }

        revalidatePath('/dashboard')
        return { success: true, zone: result.zone }
    } catch (error) {
        console.error('Zone Purchase Error:', error)
        return { error: 'حدث خطأ أثناء محاولة السيطرة على المنطقة' }
    }
}

export async function getZones(geohashes: string[]) {
    try {
        const zones = await db.zoneMaster.findMany({
            where: {
                geoHash: { in: geohashes }
            },
            include: {
                currentLord: {
                    select: { name: true, avatarUrl: true, reputationScore: true }
                }
            }
        })
        return zones
    } catch (_error) {
        return []
    }
}
