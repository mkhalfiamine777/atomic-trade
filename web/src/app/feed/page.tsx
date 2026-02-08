import { cookies } from 'next/headers'
import { VideoFeed } from '@/components/video/VideoFeed'

export default async function FeedPage() {
    const userId = (await cookies()).get('user_id')?.value

    return (
        <div className="bg-black min-h-screen">
            <VideoFeed currentUserId={userId} />
        </div>
    )
}
