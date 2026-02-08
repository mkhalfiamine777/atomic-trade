import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

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
