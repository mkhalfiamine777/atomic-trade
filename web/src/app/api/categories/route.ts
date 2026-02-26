import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
    try {
        const categories = await db.category.findMany({
            include: { subcategories: true },
            orderBy: { createdAt: 'asc' }
        });

        return NextResponse.json(categories)
    } catch (error) {
        console.error('Failed to fetch categories:', error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
