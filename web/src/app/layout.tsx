import type { Metadata, Viewport } from 'next'
import { Inter, Cairo } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import { Toaster } from 'sonner'
import { SocketProvider } from '@/providers/SocketProvider'
import { SearchMenu } from '@/components/ui/SearchMenu'
import { VideoLightbox } from '@/components/modals/VideoLightbox'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const cairo = Cairo({ subsets: ['arabic', 'latin'], variable: '--font-cairo' })

export const metadata: Metadata = {
    title: 'SouqMap - منصة التجارة المحلية الذكية',
    description: 'أول منصة تجارة اجتماعية تعتمد على الموقع الجغرافي في المغرب.',
    manifest: '/manifest.json',
    alternates: {
        canonical: 'https://atomic-trade-production.up.railway.app'
    }
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
                    cairo.variable,
                    inter.variable,
                    'min-h-screen bg-background font-sans antialiased text-foreground'
                )}
                suppressHydrationWarning
            >
                <SocketProvider>
                    <SearchMenu />
                    {children}
                    <Toaster position="top-left" richColors />
                    <VideoLightbox />
                </SocketProvider>
            </body>
        </html >
    )
}
