import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import { Toaster } from 'sonner'
import { SocketStatus } from '@/components/debug/SocketStatus'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'SouqMap - منصة التجارة المحلية الذكية',
    description: 'أول منصة تجارة اجتماعية تعتمد على الموقع الجغرافي في المغرب.',
    manifest: '/manifest.json'
}

export const viewport: Viewport = {
    themeColor: '#3b82f6',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1
}

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="ar" dir="rtl" className="dark" suppressHydrationWarning>
            <body
                className={cn(
                    inter.className,
                    'min-h-screen bg-background font-sans antialiased text-foreground'
                )}
                suppressHydrationWarning
            >
                {children}
                <SocketStatus />
                <Toaster position="top-right" richColors />
            </body>
        </html>
    )
}
