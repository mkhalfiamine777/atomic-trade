'use server'

import { db } from "@/lib/db"
import { LocationUser } from "@/types"

export async function getAllActiveUsers(): Promise<LocationUser[]> {
    try {
        const users = await db.user.findMany({
            where: {
                latitude: { not: null },
                longitude: { not: null },
            },
            select: {
                id: true,
                name: true,
                username: true,
                avatarUrl: true,
                latitude: true,
                longitude: true,
                type: true,
            }
        })

        return users.map(user => ({
            id: user.id,
            name: user.name,
            username: user.username,
            avatarUrl: user.avatarUrl,
            latitude: user.latitude as number,
            longitude: user.longitude as number,
            type: user.type as 'INDIVIDUAL' | 'SHOP' | null,
            isOnline: false,
            hasStories: false
        }))
    } catch (error) {
        console.error('Error fetching global users:', error)
        return []
    }
}
