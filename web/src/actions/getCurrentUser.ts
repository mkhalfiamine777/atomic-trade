
"use server"

import { cookies } from "next/headers"
import { db } from "@/lib/db"
import { UserProfile } from "@/types"

export async function getCurrentUser(): Promise<UserProfile | null> {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value

    if (!userId) {
        return null
    }

    try {
        const user = await db.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                username: true,
                avatarUrl: true,
                reputationScore: true,
                isVerified: true,
                type: true,
                shopCategory: true,
            }
        })

        return user as UserProfile | null
    } catch (error) {
        console.error("Error fetching current user:", error)
        return null
    }
}
