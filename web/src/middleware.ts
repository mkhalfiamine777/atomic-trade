import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const rateLimit = new Map<string, { count: number; lastReset: number }>()

export function middleware(request: NextRequest) {
    const userId = request.cookies.get('user_id')?.value
    const { pathname } = request.nextUrl

    // Public routes that don't require authentication
    // Added /feed and /upload for testing/mock mode access
    const publicRoutes = ['/', '/login', '/signup', '/dashboard']

    // Check if the current route is public
    const isPublicRoute = publicRoutes.some(
        route => pathname === route || pathname.startsWith('/u/')
    )

    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1'

    // Rate Limiting for Auth Routes (Login/Signup - POST only)
    if ((pathname === '/login' || pathname === '/signup') && request.method === 'POST') {
        const LIMIT = 5 // 5 attempts per window
        const WINDOW = 60 * 1000 // 1 minute

        const current = rateLimit.get(ip) || { count: 0, lastReset: Date.now() }

        if (Date.now() - current.lastReset > WINDOW) {
            // Reset window
            current.count = 1
            current.lastReset = Date.now()
        } else {
            current.count++
        }

        rateLimit.set(ip, current)

        if (current.count > LIMIT) {
            return new NextResponse('Too Many Requests', { status: 429 })
        }
    }

    // If the user is not authenticated and trying to access a protected route
    if (
        !userId &&
        !isPublicRoute &&
        !pathname.startsWith('/_next') &&
        !pathname.startsWith('/api') &&
        !pathname.includes('.')
    ) {
        const loginUrl = new URL('/login', request.url)
        return NextResponse.redirect(loginUrl)
    }

    // If the user is authenticated and trying to access login/signup
    if (userId && (pathname === '/login' || pathname === '/signup')) {
        const dashboardUrl = new URL('/dashboard', request.url)
        return NextResponse.redirect(dashboardUrl)
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)'
    ]
}
