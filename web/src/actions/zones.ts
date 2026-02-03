'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function purchaseZone(geohash: string, userId: string) {
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

        // 2. Check User Balance (Mocked for Demo - We assume he is rich)
        // In real logic:
        // const user = await db.user.findUnique({ where: { id: userId } })
        // if (user.walletBalance < 5000) return { error: "رصيدك غير كافي" }

        // 3. Create the Zone Fiefdom
        const newZone = await db.zoneMaster.create({
            data: {
                geoHash: geohash,
                zoneName: `إقطاعية ${geohash.slice(0, 5)}`,
                currentLordId: userId,
                taxRate: 1.5 // Default Tax
            }
        })

        // 4. Update User stats (Mock)
        // await db.user.update({ where: { id: userId }, data: { walletBalance: { decrement: 5000 } } })

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
