'use server'

import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function purchaseZone(geohash: string) {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
        return { error: 'يجب عليك تسجيل الدخول أولاً' }
    }

    try {
        // 1. Check if zone is already owned
        const existingZone = await db.zoneMaster.findUnique({
            where: { geoHash: geohash }
        })

        if (existingZone) {
            return { error: 'عذراً، هذه المنطقة مملوكة مسبقاً لسيد آخر!' }
        }

        // 2. Check User Coins Balance
        const ZONE_COST = 500 // coins
        const user = await db.user.findUnique({
            where: { id: userId },
            select: { coins: true }
        })

        if (!user || user.coins < ZONE_COST) {
            return { error: `رصيدك غير كافي. تحتاج ${ZONE_COST} عملة (لديك ${user?.coins || 0})` }
        }

        // 3. Create Zone + Deduct Coins in a transaction
        const [newZone] = await db.$transaction([
            db.zoneMaster.create({
                data: {
                    geoHash: geohash,
                    zoneName: `إقطاعية ${geohash.slice(0, 5)}`,
                    currentLordId: userId,
                    taxRate: 1.5
                }
            }),
            db.user.update({
                where: { id: userId },
                data: { coins: { decrement: ZONE_COST } }
            })
        ])

        revalidatePath('/dashboard')
        return { success: true, zone: newZone }
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
