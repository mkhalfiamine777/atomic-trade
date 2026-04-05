import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Initialize Redis only if tokens are provided
const redisUrl = process.env.UPSTASH_REDIS_REST_URL
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

const ratelimit = (redisUrl && redisToken)
    ? new Ratelimit({
        redis: new Redis({ url: redisUrl, token: redisToken }),
        // 10 requests per 10 seconds per IP
        limiter: Ratelimit.slidingWindow(10, '10 s'),
        analytics: true,
    })
    : null;

export async function middleware(request: NextRequest) {
    const userId = request.cookies.get('user_id')?.value
    const { pathname } = request.nextUrl

    // Public routes that don't require authentication
    // Note: /dashboard is intentionally public — unauthenticated users see GuestDashboardClient (map only)
    const publicRoutes = ['/', '/login', '/signup', '/dashboard']

    // Check if the current route is public
    const isPublicRoute = publicRoutes.some(
        route => pathname === route || pathname.startsWith('/u/')
    )

    // 🛡️ Upstash Redis Rate Limiting
    // Apply rate limiting specifically to APIs and Sensitive routes (login, signup)
    if (ratelimit && (pathname.startsWith('/api/') || pathname === '/login' || pathname === '/signup')) {
        const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
        try {
            const { success, pending, limit, reset, remaining } = await ratelimit.limit(`ratelimit_${ip}`);
            if (!success) {
                console.warn(`🚨 Rate Limit Exceeded for IP: ${ip} on path ${pathname}`);
                return NextResponse.json({ error: 'Too many requests. Please try again later.' }, {
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': limit.toString(),
                        'X-RateLimit-Remaining': remaining.toString(),
                        'X-RateLimit-Reset': reset.toString(),
                    }
                });
            }
        } catch (error) {
            console.error('Rate Limit Check Failed:', error);
            // Allow request to proceed if Redis fails to avoid blocking legitimate users during outages
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
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)'
    ]
}
