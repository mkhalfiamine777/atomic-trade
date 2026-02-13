'use server'

import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

// ... imports
import { Prisma, UserType } from '@prisma/client'

export async function updateProfile(formData: FormData) {
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get('user_id')?.value

        if (!userId) {
            return { success: false, error: 'Unauthorized' }
        }

        const name = formData.get('name') as string
        const username = formData.get('username') as string
        const avatarUrl = formData.get('avatarUrl') as string
        const type = formData.get('type') as UserType // INDIVIDUAL or SHOP
        const shopCategory = formData.get('shopCategory') as string | null

        // Validate basic inputs
        if (!name || name.trim().length < 2) {
            return { success: false, error: 'Name is too short (min 2 chars)' }
        }

        // Validate Username
        if (username) {
            const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
            if (!usernameRegex.test(username)) {
                return { success: false, error: 'اسم المستخدم يجب أن يحتوي على أحرف إنجليزية وأرقام و _ فقط (3-20 حرف)' }
            }
        }

        // Update User
        try {
            await db.user.update({
                where: { id: userId },
                data: {
                    name: name.trim(),
                    username: username ? username.toLowerCase() : undefined,
                    avatarUrl: avatarUrl || undefined, // Only update if provided
                    type: type || undefined,
                    shopCategory: shopCategory || undefined
                }
            })
        } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError) {
                if (e.code === 'P2002') {
                    return { success: false, error: 'اسم المستخدم هذا مأخوذ بالفعل 😔' }
                }
            }
            throw e
        }

        revalidatePath(`/u/${userId}`)
        return { success: true, error: undefined }

    } catch (error) {
        console.error('Error updating profile:', error)
        return { success: false, error: 'Failed to update profile' }
    }
}
