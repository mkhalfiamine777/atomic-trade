'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { UserType } from '@prisma/client'

import bcrypt from 'bcryptjs'

import { loginSchema, signupSchema } from '@/lib/schemas'

export async function login(_prevState: unknown, formData: FormData) {
    const rawData = {
        phone: formData.get('phone'),
        password: formData.get('password'),
    }

    const validatedFields = loginSchema.safeParse(rawData)

    if (!validatedFields.success) {
        return { error: validatedFields.error.flatten().fieldErrors.phone?.[0] || validatedFields.error.flatten().fieldErrors.password?.[0] || "بيانات غير صالحة" }
    }

    const { phone, password } = validatedFields.data

    try {
        const user = await db.user.findUnique({
            where: { phone }
        })

        // Password validation is handled below with bcrypt

        // Check password (support both hashed and legacy plain-text for dev transition if needed,
        // but for strict security we only support hashed)
        const isMatch = await bcrypt.compare(password, user?.password || '')

        if (!user || !isMatch) {
            return { error: 'رقم الهاتف أو كلمة المرور غير صحيحة' }
        }

        // Set secure session cookie
        const cookieStore = await cookies()
        cookieStore.set('user_id', user.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        })
    } catch (error) {
        console.error('Login error:', error)
        return { error: 'حدث خطأ ما' }
    }

    redirect('/dashboard')
}

export async function signup(_prevState: unknown, formData: FormData) {
    const rawData = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        password: formData.get('password'),
        type: formData.get('type'),
        shopCategory: formData.get('shopCategory'),
    }

    const validatedFields = signupSchema.safeParse(rawData)

    if (!validatedFields.success) {
        const errors = validatedFields.error.flatten().fieldErrors
        return { error: errors.name?.[0] || errors.phone?.[0] || errors.password?.[0] || "البيانات غير صالحة" }
    }

    const { name, phone, password, type, shopCategory } = validatedFields.data

    try {
        // Check if user exists
        const existingUser = await db.user.findUnique({
            where: { phone }
        })

        if (existingUser) {
            return { error: 'المستخدم مسجل بالفعل' }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create user
        const newUser = await db.user.create({
            data: {
                phone,
                name,
                username: name ? `${name.replace(/\s+/g, '').toLowerCase()}${Math.floor(Math.random() * 1000)}` : `user${Math.floor(Math.random() * 10000)}`,
                password: hashedPassword,
                type: type,
                shopCategory
            }
        })

        // Set secure session cookie
        const cookieStore = await cookies()
        cookieStore.set('user_id', newUser.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        })
    } catch (error) {
        console.error('Signup error:', error)
        return { error: error instanceof Error ? error.message : 'فشل التسجيل' }
    }

    // Redirect to dashboard or login
    redirect('/dashboard')
}

export async function logout() {
    const cookieStore = await cookies()
    cookieStore.delete('user_id')
    redirect('/login')
}

// Get current logged-in user from session cookie
export async function getUser() {
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get('user_id')?.value

        if (!userId) return null

        const user = await db.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                username: true,
                phone: true,
                avatarUrl: true,
                type: true,
                shopCategory: true,
                bio: true,
                reputationScore: true,
                isVerified: true,
                latitude: true,
                longitude: true,
                createdAt: true,
                // ⛔ password explicitly excluded
            }
        })

        return user
    } catch (error) {
        console.error("Error getting user session:", error)
        return null
    }
}
