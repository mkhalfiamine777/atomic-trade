'use server'

import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { Prisma, UserType } from '@prisma/client'
import bcrypt from 'bcryptjs'

// Allowed image domains for avatarUrl validation
const ALLOWED_IMAGE_DOMAINS = [
    'utfs.io',           // uploadthing
    'ufs.sh',            // uploadthing v2
    'uploadthing.com',
    'res.cloudinary.com',
    'lh3.googleusercontent.com',
    'avatars.githubusercontent.com',
    'i.imgur.com',
    'images.unsplash.com',
]

function isValidAvatarUrl(url: string): boolean {
    if (!url) return true // empty is ok
    try {
        const parsed = new URL(url)
        if (!['http:', 'https:'].includes(parsed.protocol)) return false
        // Check domain whitelist
        const domain = parsed.hostname
        return ALLOWED_IMAGE_DOMAINS.some(d => domain === d || domain.endsWith('.' + d))
    } catch {
        return false
    }
}

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
        const bio = formData.get('bio') as string | null
        const type = formData.get('type') as string | null
        const shopCategory = formData.get('shopCategory') as string | null

        // Validate UserType whitelist
        const validTypes = ['INDIVIDUAL', 'SHOP', 'COMPANY']
        if (type && !validTypes.includes(type)) {
            return { success: false, error: 'نوع الحساب غير صالح' }
        }
        const currentPassword = formData.get('currentPassword') as string | null
        const newPassword = formData.get('newPassword') as string | null

        // Validate basic inputs
        if (!name || name.trim().length < 2) {
            return { success: false, error: 'الاسم قصير جداً (حرفان على الأقل)' }
        }

        // Validate Username
        if (username) {
            const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
            if (!usernameRegex.test(username)) {
                return { success: false, error: 'اسم المستخدم يجب أن يحتوي على أحرف إنجليزية وأرقام و _ فقط (3-20 حرف)' }
            }
        }

        // Validate Bio length
        if (bio && bio.length > 200) {
            return { success: false, error: 'النبذة التعريفية طويلة جداً (200 حرف كحد أقصى)' }
        }

        // Validate Avatar URL security
        if (avatarUrl && !isValidAvatarUrl(avatarUrl)) {
            return { success: false, error: 'رابط الصورة غير مسموح به. استخدم زر الرفع أو رابط من مصدر معتمد.' }
        }

        // Handle password change
        let hashedPassword: string | undefined
        if (currentPassword && newPassword) {
            if (newPassword.length < 6) {
                return { success: false, error: 'كلمة المرور الجديدة قصيرة جداً (6 أحرف على الأقل)' }
            }
            const user = await db.user.findUnique({ where: { id: userId }, select: { password: true } })
            if (!user) return { success: false, error: 'المستخدم غير موجود' }

            const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
            if (!isPasswordValid) {
                return { success: false, error: 'كلمة المرور الحالية غير صحيحة' }
            }
            hashedPassword = await bcrypt.hash(newPassword, 12)
        }

        // Update User
        try {
            await db.user.update({
                where: { id: userId },
                data: {
                    name: name.trim(),
                    username: username ? username.toLowerCase() : undefined,
                    avatarUrl: avatarUrl || undefined,
                    bio: bio !== null ? bio.trim() : undefined,
                    type: (type as UserType) || undefined,
                    shopCategory: shopCategory || undefined,
                    ...(hashedPassword ? { password: hashedPassword } : {})
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
        return { success: false, error: 'فشل تحديث الملف الشخصي' }
    }
}
