import { cookies } from 'next/headers'
import { VideoFeed } from '@/components/video/VideoFeed'

import Link from 'next/link'

export default async function ExplorePage() {
    const userId = (await cookies()).get('user_id')?.value

    return (
        <div className="bg-black min-h-screen relative">
            {/* Floating Navigation (Back to Map) */}
            <div className="fixed top-4 right-4 z-50">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full text-sm font-medium hover:bg-white/10 transition-colors text-white"
                >
                    <span className="text-xl">🗺️</span>
                    <span className="hidden sm:inline">الخريطة</span>
                </Link>
            </div>

            <VideoFeed currentUserId={userId} />
        </div>
    )
}
