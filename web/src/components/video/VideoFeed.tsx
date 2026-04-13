'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { VideoPlayer } from './VideoPlayer'
import { ImageViewer } from './ImageViewer'
import { ListingFeedCard } from './ListingFeedCard'
import { VideoActions } from './VideoActions'
import { getMixedFeed, type FeedItemDTO } from '@/actions/feed'
import { toast } from 'sonner'
import { Loader2, ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

export function VideoFeed({ currentUserId }: { currentUserId?: string }) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [feedItems, setFeedItems] = useState<FeedItemDTO[]>([])
    const [activeIndex, setActiveIndex] = useState(0)
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const loaderRef = useRef<HTMLDivElement>(null)

    // 🏷️ Filter State
    const [feedFilter, setFeedFilter] = useState<'SOCIAL' | 'COMMERCE'>('SOCIAL')

    const handleFilterChange = (type: 'SOCIAL' | 'COMMERCE') => {
        if (feedFilter === type) return
        setFeedFilter(type)
        setFeedItems([])
        setPage(1)
        setHasMore(true)
        setLoading(true)
    }

    // 👻 Ghost Product Session State
    const [watchedVideos, setWatchedVideos] = useState<Set<string>>(new Set())

    const handleVideoEnd = useCallback((id: string) => {
        setWatchedVideos(prev => {
            if (prev.has(id)) return prev
            const next = new Set(prev)
            next.add(id)
            return next
        })
    }, [])

    // Preload Next Item Strategy (Video or Image)
    useEffect(() => {
        if (feedItems.length <= activeIndex + 1) return

        const nextItem = feedItems[activeIndex + 1]
        const link = document.createElement('link')
        link.rel = 'preload'

        if (nextItem.type === 'VIDEO') {
            link.as = 'video'
            link.href = nextItem.url
        } else if (nextItem.type === 'IMAGE' || nextItem.type === 'STORY' || nextItem.type === 'LISTING') {
            link.as = 'image'
            link.href = nextItem.url
        } else {
            return // Unknown type — skip preload entirely
        }

        document.head.appendChild(link)
        return () => {
            document.head.removeChild(link)
        }
    }, [activeIndex, feedItems])

    // Fetch Feed Items
    const loadItems = useCallback(async () => {
        try {
            const newItems = await getMixedFeed(page, 10, currentUserId, feedFilter)
            if (newItems.length === 0) {
                setHasMore(false)
                if (page === 1) toast.info('لا يوجد محتوى حالياً')
            } else {
                setFeedItems(prev => page === 1 ? newItems : [...prev, ...newItems])
            }
        } catch (error) {
            console.error(error)
            toast.error('حدث خطأ في تحميل المحتوى')
        } finally {
            setLoading(false)
        }
    }, [page, currentUserId, feedFilter])

    useEffect(() => {
        loadItems()
    }, [loadItems])

    // Infinite Scroll Intersection Observer for fetching more
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const target = entries[0]
                if (target.isIntersecting && hasMore && !loading) {
                    setPage(prev => prev + 1)
                }
            },
            { root: containerRef.current, threshold: 0.1 }
        )

        if (loaderRef.current) observer.observe(loaderRef.current)

        return () => observer.disconnect()
    }, [hasMore, loading])

    // Handle Scroll Snapping Intersection
    useEffect(() => {
        const options = {
            root: containerRef.current,
            threshold: 0.6 // 60% of item visible
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

        // Observe all feed elements (need a small delay to ensure DOM update)
        const timeout = setTimeout(() => {
            const elements = document.querySelectorAll('.feed-item')
            elements.forEach(el => observer.observe(el))
        }, 500)

        return () => {
            observer.disconnect()
            clearTimeout(timeout)
        }
    }, [feedItems])

    if (loading && feedItems.length === 0) {
        return (
            <div className="h-[calc(100vh-64px)] w-full flex items-center justify-center bg-black">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            </div>
        )
    }

    return (
        <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden bg-black">
            {/* Overlay Tabs Filter */}
            <div className="absolute top-0 left-0 right-0 z-50 flex justify-center pt-6 pb-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none">
                <div className="flex items-center gap-6 text-base font-bold shadow-sm pointer-events-auto backdrop-blur-md bg-white/10 px-6 py-2 rounded-full border border-white/20">
                    <button 
                        onClick={() => handleFilterChange('SOCIAL')}
                        className={`transition-colors drop-shadow-md ${feedFilter === 'SOCIAL' ? 'text-white border-b-2 border-white pb-1' : 'text-white/60 hover:text-white/90 pb-1'}`}
                    >
                        ترفيه
                    </button>
                    <button 
                        onClick={() => handleFilterChange('COMMERCE')}
                        className={`flex items-center gap-1.5 transition-colors drop-shadow-md ${feedFilter === 'COMMERCE' ? 'text-amber-400 border-b-2 border-amber-400 pb-1' : 'text-white/60 hover:text-white/90 pb-1'}`}
                    >
                        <span>تسوق المتاجر</span>
                    </button>
                </div>
            </div>

            <div
                ref={containerRef}
                className="h-full w-full overflow-y-scroll snap-y snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // Hide scrollbar
            >
            {feedItems.map((item, index) => (
                <div
                    key={`${item.id}-${index}`}
                    data-index={index}
                    className="feed-item relative w-full h-full snap-start flex items-center justify-center bg-zinc-900 border-b border-zinc-800"
                >
                    {/* Max Width Container — Responsive: tight on mobile, wider on desktop */}
                    <div className="relative w-full h-full max-w-sm md:max-w-2xl mx-auto bg-black">

                        {Math.abs(index - activeIndex) <= 1 ? (
                            <>
                                {item.type === 'LISTING' ? (
                                    <ListingFeedCard
                                        item={item}
                                        isActive={index === activeIndex}
                                        isGhost={!item.isGoldenDeal && (item.id.charCodeAt(0) % 3 === 0)}
                                        videosNeededForUnlock={Math.max(0, 3 - watchedVideos.size)}
                                    />
                                ) : item.type === 'VIDEO' ? (
                                    <div className="w-full h-full relative">
                                        <VideoPlayer
                                            src={item.url}
                                            isActive={index === activeIndex}
                                            postId={item.id}
                                            onEnd={() => handleVideoEnd(item.id)}
                                        />

                                        {/* Overlay Content for Video */}
                                        <div className="absolute bottom-0 left-0 right-0 p-4 pb-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none z-10">
                                            <div className="flex flex-col items-end w-full pr-16">
                                                <div className="pointer-events-auto text-right w-full flex flex-col items-end">
                                                    <Link href={`/activity/${item.sellerId || item.sellerUsername || item.username}`} className="text-white font-bold text-lg drop-shadow-md mb-1 flex items-center justify-end gap-2 hover:underline">
                                                        {item.isShop && <span className="text-[10px] bg-indigo-500 px-2 py-0.5 rounded-full text-white font-bold">متجر</span>}
                                                        {item.username}
                                                    </Link>
                                                    <p className="text-white/90 text-sm drop-shadow-md leading-relaxed line-clamp-3 ml-auto" dir="rtl">
                                                        {item.description}
                                                    </p>
                                                    {/* زر التوجه للرفوف */}
                                                    {item.isShop && (
                                                        <Link href={`/activity/${item.sellerId || item.sellerUsername || item.username}`} className="mt-3 inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold px-5 py-2.5 rounded-full shadow-lg shadow-orange-500/30 hover:scale-105 transition-transform origin-right">
                                                            <ShoppingBag className="w-4 h-4" />
                                                            <span>اكتشف رفوف المتجر</span>
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions for Video */}
                                        <div className="absolute right-2 bottom-20 z-20 pointer-events-auto">
                                            <VideoActions
                                                postId={item.id}
                                                likes={item.likes}
                                                comments={item.comments}
                                                shares={item.shares}
                                                location={item.location}
                                                isLiked={item.isLiked}
                                                author={{
                                                    name: item.username,
                                                    avatar: item.userAvatar,
                                                    isShop: item.isShop
                                                }}
                                                currentUserId={currentUserId}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <ImageViewer
                                        id={item.id}
                                        src={item.url}
                                        caption={item.description}
                                        username={item.username}
                                        sellerUsername={item.sellerUsername}
                                        sellerId={item.sellerId}
                                        userAvatar={item.userAvatar}
                                        isActive={index === activeIndex}
                                        likes={item.likes}
                                        comments={item.comments}
                                        shares={item.shares}
                                        isLiked={item.isLiked}
                                        location={item.location}
                                        isShop={item.isShop}
                                        currentUserId={currentUserId}
                                    />
                                )}
                            </>
                        ) : (
                            // Placeholder for Virtualization
                            <div className="w-full h-full bg-black flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-white/20" />
                            </div>
                        )}

                    </div>
                </div>
            ))}

            {/* Skeleton Loading State / Infinite Scroll Sentinel */}
            {hasMore && feedItems.length > 0 && (
                <div ref={loaderRef} className="feed-item relative w-full h-full snap-start flex items-center justify-center bg-zinc-900 border-b border-zinc-800">
                    <div className="relative w-full h-full max-w-md mx-auto bg-black p-4 flex flex-col justify-end pb-20">
                        {/* Fake Video Actions */}
                        <div className="absolute right-4 bottom-20 flex flex-col gap-6 items-center z-20">
                            <Skeleton className="w-12 h-12 rounded-full border-2 border-zinc-800" />
                            <div className="space-y-4">
                                <Skeleton className="w-10 h-10 rounded-full" />
                                <Skeleton className="w-10 h-10 rounded-full" />
                                <Skeleton className="w-10 h-10 rounded-full" />
                            </div>
                        </div>
                        {/* Fake Description Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 pb-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none z-10 w-full">
                            <div className="flex flex-col items-end w-full pr-16 space-y-3">
                                <Skeleton className="w-1/3 h-5 rounded ml-auto" />
                                <Skeleton className="w-2/3 h-4 rounded ml-auto" />
                                <Skeleton className="w-1/2 h-4 rounded ml-auto" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!loading && feedItems.length === 0 && (
                <div className="h-full w-full flex flex-col items-center justify-center text-white space-y-4 snap-start">
                    <p className="text-xl font-bold">لا يوجد محتوى بعد 😔</p>
                    <p className="text-zinc-400">كن أول من ينشر!</p>
                </div>
            )}

            {/* End of Feed */}
            {!hasMore && feedItems.length > 0 && (
                <div className="feed-item snap-start w-full h-32 flex flex-col items-center justify-center text-zinc-500">
                    <p className="font-bold">🏁 وصلت إلى النهاية</p>
                </div>
            )}
            </div>
        </div>
    )
}
