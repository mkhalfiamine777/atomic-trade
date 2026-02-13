'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { UserType } from '@prisma/client'

import bcrypt from 'bcryptjs'

export async function login(_prevState: unknown, formData: FormData) {
    const phone = formData.get('phone') as string
    const password = formData.get('password') as string

    if (!phone || !password) {
        return { error: 'Please fill in all fields' }
    }

    try {
        const user = await db.user.findUnique({
            where: { phone }
        })

        // Password validation is handled below with bcrypt

        // Check password (support both hashed and legacy plain-text for dev transition if needed,
        // but for strict security we only support hashed)
        const isMatch = await bcrypt.compare(password, user?.password || '')

        if (!user || !isMatch) {
            return { error: 'Invalid credentials' }
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
        return { error: 'Something went wrong' }
    }

    redirect('/dashboard')
}

export async function signup(_prevState: unknown, formData: FormData) {
    const phone = formData.get('phone') as string
    const name = formData.get('name') as string
    const password = formData.get('password') as string
    const type = formData.get('type') as string // 'INDIVIDUAL' or 'SHOP'
    const shopCategory = (formData.get('shopCategory') as string) || null

    if (!phone || !password || !name) {
        return { error: 'Please fill in all fields' }
    }

    try {
        // Check if user exists
        const existingUser = await db.user.findUnique({
            where: { phone }
        })

        if (existingUser) {
            return { error: 'User already exists' }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create user
        const newUser = await db.user.create({
            data: {
                phone,
                name,
                password: hashedPassword,
                type: (type as UserType) || UserType.INDIVIDUAL,
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
        return { error: error instanceof Error ? error.message : 'Signup failed' }
    }

    // Redirect to dashboard or login
    redirect('/dashboard')
}
