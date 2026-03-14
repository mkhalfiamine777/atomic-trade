/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: '20mb',
        },
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'utfs.io',
                port: '',
                pathname: '/**'
            },
            {
                protocol: 'https',
                hostname: 'picsum.photos',
                port: '',
                pathname: '/**'
            },
            {
                protocol: 'https',
                hostname: 'jwbamcdz4e.ufs.sh',
                port: '',
                pathname: '/**'
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                port: '',
                pathname: '/**'
            }
        ]
    },

    // 🛡️ Security Headers
    async headers() {
        // CSP Directives — Next.js requires 'unsafe-inline' and 'unsafe-eval' for its runtime
        const cspDirectives = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "img-src 'self' data: blob: https: http:",
            "font-src 'self' https://fonts.gstatic.com data:",
            "connect-src 'self' wss: ws: https://utfs.io https://*.utfs.io https://jwbamcdz4e.ufs.sh https://uploadthing.com https://*.uploadthing.com",
            "media-src 'self' blob: https://utfs.io https://*.utfs.io https://jwbamcdz4e.ufs.sh",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'self'",
        ].join('; ')

        return [
            {
                source: '/(.*)',
                headers: [
                    // ── Existing headers ──────────────────────
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on'
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block'
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'SAMEORIGIN'
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'origin-when-cross-origin'
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=(self)'
                    },
                    // ── NEW: CSP — Prevents XSS attacks ──────
                    {
                        key: 'Content-Security-Policy',
                        value: cspDirectives
                    },
                    // ── NEW: HSTS — Forces HTTPS (2 years) ───
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=63072000; includeSubDomains; preload'
                    },
                    // ── NEW: COOP — Window isolation ──────────
                    {
                        key: 'Cross-Origin-Opener-Policy',
                        value: 'same-origin-allow-popups'
                    },
                    // ── NEW: Trusted Types — Report-only mode to monitor without breaking ──
                    {
                        key: 'Content-Security-Policy-Report-Only',
                        value: "require-trusted-types-for 'script'"
                    },
                ]
            }
        ]
    }
};

export default nextConfig;
