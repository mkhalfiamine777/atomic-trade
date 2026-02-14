'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { VideoPlayer } from './VideoPlayer'
import { VideoActions } from './VideoActions'
import { getFeedVideos, type VideoPostDTO } from '@/actions/feed'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function VideoFeed({ currentUserId }: { currentUserId?: string }) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [videos, setVideos] = useState<VideoPostDTO[]>([])
    const [activeIndex, setActiveIndex] = useState(0)
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)

    // Fetch Videos
    const loadVideos = useCallback(async () => {
        try {
            const newVideos = await getFeedVideos(page, 10, currentUserId)
            if (newVideos.length === 0) {
                setHasMore(false)
                if (page === 1) toast.info('لا توجد فيديوهات حالياً')
            } else {
                setVideos(prev => [...prev, ...newVideos])
            }
        } catch (error) {
            console.error(error)
            toast.error('حدث خطأ في تحميل الفيديوهات')
        } finally {
            setLoading(false)
        }
    }, [page, currentUserId])

    useEffect(() => {
        loadVideos()
    }, [loadVideos])

    // Simple infinite scroll handler
    const handleScroll = () => {
        if (!containerRef.current) return;
        const { scrollTop, clientHeight, scrollHeight } = containerRef.current;

        // If we are near bottom
        if (scrollHeight - scrollTop <= clientHeight * 2 && hasMore && !loading) {
            setPage(prev => prev + 1)
        }
    }

    // Handle Scroll Snapping Intersection
    useEffect(() => {
        const options = {
            root: containerRef.current,
            threshold: 0.6 // 60% of video visible
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const index = Number(entry.target.getAttribute('data-index'))
                    if (!isNaN(index)) {
                        setActiveIndex(index)
                    }
                }
            })
        }, options)

        // Observe all video elements (need a small delay to ensure DOM update)
        const timeout = setTimeout(() => {
            const elements = document.querySelectorAll('.video-post')
            elements.forEach(el => observer.observe(el))
        }, 500)

        return () => {
            observer.disconnect()
            clearTimeout(timeout)
        }
    }, [videos])

    if (loading && videos.length === 0) {
        return (
            <div className="h-[calc(100vh-64px)] w-full flex items-center justify-center bg-black">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            </div>
        )
    }

    return (
        <div
            ref={containerRef}
            onScroll={handleScroll}
            className="h-[calc(100vh-64px)] w-full overflow-y-scroll snap-y snap-mandatory bg-black"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // Hide scrollbar
        >
            {videos.map((video, index) => (
                <div
                    key={`${video.id}-${index}`}
                    data-index={index}
                    className="video-post relative w-full h-full snap-start flex items-center justify-center bg-zinc-900 border-b border-zinc-800"
                >
                    {/* Max Width Container for Desktop */}
                    <div className="relative w-full h-full max-w-md mx-auto bg-black">

                        <VideoPlayer
                            src={video.url}
                            isActive={index === activeIndex}
                        />

                        {/* Overlay Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 pb-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none z-10">
                            <div className="flex flex-col items-end w-full pr-16">
                                <div className="pointer-events-auto text-right w-full">
                                    <Link href={`/u/${video.username}`} className="text-white font-bold text-lg drop-shadow-md mb-1 flex items-center justify-end gap-2 hover:underline">
                                        {video.isShop && <span className="text-[10px] bg-indigo-500 px-1.5 py-0.5 rounded text-white font-normal">متجر</span>}
                                        {video.username}
                                    </Link>
                                    <p className="text-white/90 text-sm drop-shadow-md leading-relaxed line-clamp-3 ml-auto" dir="rtl">
                                        {video.description}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Actions Side Bar */}
                        <div className="absolute right-2 bottom-20 z-20 pointer-events-auto">
                            <VideoActions
                                postId={video.id}
                                likes={video.likes}
                                comments={video.comments}
                                shares={video.shares}
                                location={video.location}
                                isLiked={video.isLiked}
                                author={{
                                    name: video.username,
                                    avatar: video.userAvatar,
                                    isShop: video.isShop
                                }}
                                currentUserId={currentUserId}
                            />
                        </div>
                    </div>
                </div>
            ))}

            {/* Empty State */}
            {!loading && videos.length === 0 && (
                <div className="h-full w-full flex flex-col items-center justify-center text-white space-y-4">
                    <p className="text-xl font-bold">لا توجد فيديوهات بعد 😔</p>
                    <p className="text-zinc-400">كن أول من ينشر!</p>
                </div>
            )}
        </div>
    )
}
