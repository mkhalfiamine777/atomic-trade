
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
    // Only allow in explicit development mode
    if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json({ error: 'Not allowed outside development' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')
    const scoreStr = searchParams.get('score')

    if (!username || !scoreStr) {
        return NextResponse.json({ error: 'Missing username or score' }, { status: 400 })
    }

    const score = parseInt(scoreStr, 10)
    if (isNaN(score)) {
        return NextResponse.json({ error: 'Invalid score' }, { status: 400 })
    }

    try {
        // Try finding by username (unique)
        let user = await db.user.findUnique({
            where: { username }
        })

        // If not found, try by name (first match)
        if (!user) {
            user = await db.user.findFirst({
                where: { name: username }
            })
        }

        // If still not found, try by ID
        if (!user) {
            user = await db.user.findUnique({
                where: { id: username }
            })
        }

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const updatedUser = await db.user.update({
            where: { id: user.id },
            data: { reputationScore: score },
            select: {
                id: true,
                username: true,
                name: true,
                reputationScore: true,
                avatarUrl: true,
                type: true,
                isVerified: true
            }
        })

        return NextResponse.json({
            success: true,
            message: `Updated ${updatedUser.username || updatedUser.name} to ${updatedUser.reputationScore}`,
            user: updatedUser
        })

    } catch (error) {
        console.error('Error updating reputation:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
