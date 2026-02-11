'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, ShoppingBag, Megaphone, Image as ImageIcon, Loader2 } from 'lucide-react'
import { PostModal } from '@/components/post/PostModal'
import { cn } from '@/lib/utils'
import { getProfileContent } from '@/actions/getProfileContent'
import { TabStory, TabListing, TabPost } from '@/types'

interface Props {
    userId: string
    initialStories: TabStory[]
    initialPosts: TabPost[]
    initialProducts: TabListing[]
    initialRequests: TabListing[]
}

type TabType = 'MEDIA' | 'SALES' | 'REQUESTS'

export function ProfileTabs({ userId, initialStories, initialPosts, initialProducts, initialRequests }: Props) {
    const getInitialTab = (): TabType => {
        if (initialProducts.length > 0) return 'SALES'
        if (initialRequests.length > 0) return 'REQUESTS'
        return 'MEDIA'
    }

    const [activeTab, setActiveTab] = useState<TabType>(getInitialTab())
    const [selectedPost, setSelectedPost] = useState<TabPost | null>(null)

    // State for Data
    const [posts, setPosts] = useState<TabPost[]>(initialPosts)
    const [products, setProducts] = useState<TabListing[]>(initialProducts)
    const [requests, setRequests] = useState<TabListing[]>(initialRequests)

    // State for Pagination
    const [mediaPage, setMediaPage] = useState(1)
    const [salesPage, setSalesPage] = useState(1)
    const [requestsPage, setRequestsPage] = useState(1)

    const [hasMoreMedia, setHasMoreMedia] = useState(true)
    const [hasMoreSales, setHasMoreSales] = useState(true)
    const [hasMoreRequests, setHasMoreRequests] = useState(true)

    const [isLoading, setIsLoading] = useState(false)

    const loadMore = useCallback(async () => {
        if (isLoading) return
        setIsLoading(true)

        try {
            if (activeTab === 'MEDIA') {
                const nextPage = mediaPage + 1
                const res = await getProfileContent(userId, 'MEDIA', nextPage)
                if (res.success && res.data) {
                    setPosts(prev => {
                        const newPosts = res.data
                            .map((p: any) => ({
                                id: p.id, // Assuming backend matches schema
                                mediaUrl: p.mediaUrl,
                                mediaType: p.mediaType,
                                caption: p.caption
                            }))
                            .filter((p: TabPost) => !prev.some(existing => existing.id === p.id))
                        return [...prev, ...newPosts]
                    })
                    setMediaPage(nextPage)
                    setHasMoreMedia(res.hasMore)
                } else {
                    setHasMoreMedia(false)
                }
            } else if (activeTab === 'SALES') {
                const nextPage = salesPage + 1
                const res = await getProfileContent(userId, 'SALES', nextPage)
                if (res.success && res.data) {
                    setProducts(prev => {
                        const newProducts = res.data
                            .map((l: any) => ({
                                id: l.id,
                                title: l.title,
                                price: l.price,
                                images: l.images
                            }))
                            .filter((l: TabListing) => !prev.some(existing => existing.id === l.id))
                        return [...prev, ...newProducts]
                    })
                    setSalesPage(nextPage)
                    setHasMoreSales(res.hasMore)
                } else {
                    setHasMoreSales(false)
                }
            } else if (activeTab === 'REQUESTS') {
                const nextPage = requestsPage + 1
                const res = await getProfileContent(userId, 'REQUESTS', nextPage)
                if (res.success && res.data) {
                    setRequests(prev => {
                        const newRequests = res.data
                            .map((l: any) => ({
                                id: l.id,
                                title: l.title,
                                price: l.price,
                                images: l.images
                            }))
                            .filter((l: TabListing) => !prev.some(existing => existing.id === l.id))
                        return [...prev, ...newRequests]
                    })
                    setRequestsPage(nextPage)
                    setHasMoreRequests(res.hasMore)
                } else {
                    setHasMoreRequests(false)
                }
            }
        } catch (error) {
            console.error("Failed to load more", error)
        } finally {
            setIsLoading(false)
        }
    }, [activeTab, isLoading, userId, mediaPage, salesPage, requestsPage])


    const mediaCount = initialStories.length + posts.length
    const salesCount = products.length
    const requestsCount = requests.length

    return (
        <div className="w-full">
            {/* Tabs Header */}
            <div className="flex border-b border-zinc-800 mb-4 overflow-x-auto scrollbar-hide">
                <TabButton
                    isActive={activeTab === 'MEDIA'}
                    onClick={() => setActiveTab('MEDIA')}
                    icon={<ImageIcon className="w-4 h-4" />}
                    label="الوسائط"
                    count={mediaCount}
                />
                <TabButton
                    isActive={activeTab === 'SALES'}
                    onClick={() => setActiveTab('SALES')}
                    icon={<ShoppingBag className="w-4 h-4" />}
                    label="المبيعات"
                    count={salesCount}
                />
                <TabButton
                    isActive={activeTab === 'REQUESTS'}
                    onClick={() => setActiveTab('REQUESTS')}
                    icon={<Megaphone className="w-4 h-4" />}
                    label="الطلبات"
                    count={requestsCount}
                />
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="min-h-[200px] flex flex-col gap-4"
                >
                    {activeTab === 'MEDIA' && (
                        <>
                            <MediaGrid
                                stories={initialStories}
                                posts={posts}
                                onPostClick={(post) => setSelectedPost(post)}
                            />
                            <InfiniteScrollSentinel
                                onIntersect={loadMore}
                                hasMore={hasMoreMedia}
                                isLoading={isLoading}
                            />
                        </>
                    )}
                    {activeTab === 'SALES' && (
                        <>
                            <ListingsGrid items={products} type="PRODUCT" />
                            <InfiniteScrollSentinel
                                onIntersect={loadMore}
                                hasMore={hasMoreSales}
                                isLoading={isLoading}
                            />
                        </>
                    )}
                    {activeTab === 'REQUESTS' && (
                        <>
                            <ListingsGrid items={requests} type="REQUEST" />
                            <InfiniteScrollSentinel
                                onIntersect={loadMore}
                                hasMore={hasMoreRequests}
                                isLoading={isLoading}
                            />
                        </>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Media Viewer Modal */}
            <PostModal
                isOpen={!!selectedPost}
                onClose={() => setSelectedPost(null)}
                post={selectedPost}
            />
        </div>
    )
}

function InfiniteScrollSentinel({ onIntersect, hasMore, isLoading }: {
    onIntersect: () => void
    hasMore: boolean
    isLoading: boolean
}) {
    const observerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!hasMore || isLoading) return

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    onIntersect()
                }
            },
            { threshold: 0.1, rootMargin: '10px' }
        )

        if (observerRef.current) {
            observer.observe(observerRef.current)
        }

        return () => observer.disconnect()
    }, [hasMore, isLoading, onIntersect])

    if (!hasMore) return null

    return (
        <div ref={observerRef} className="flex justify-center p-6 h-20 w-full">
            {isLoading && (
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            )}
        </div>
    )
}

function TabButton({ isActive, onClick, icon, label, count }: { isActive: boolean; onClick: () => void; icon: React.ReactNode; label: string; count: number }) {
    return (
        <button
            onClick={onClick}
            className={`flex-1 flex items-center justify-center gap-2 py-4 px-2 relative transition-colors ${isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
            {icon}
            <span className="font-bold text-sm">{label}</span>
            <span className="text-xs bg-zinc-800 px-1.5 py-0.5 rounded-full text-zinc-400">{count}</span>

            {isActive && (
                <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"
                />
            )}
        </button>
    )
}

function MediaGrid({ stories, posts, onPostClick }: { stories: TabStory[], posts: TabPost[], onPostClick: (post: TabPost) => void }) {
    const storyItems = stories.map(s => ({
        id: s.id,
        mediaUrl: s.mediaUrl,
        mediaType: s.mediaType,
        caption: s.caption,
        _type: 'STORY' as const
    }))

    const postItems = posts.map(p => ({
        id: p.id,
        mediaUrl: p.mediaUrl,
        mediaType: p.mediaType || 'IMAGE',
        caption: p.caption,
        _type: 'POST' as const
    }))

    const items: (TabPost & { _type: 'STORY' | 'POST' })[] = [...storyItems, ...postItems]

    if (items.length === 0) return <EmptyState label="لا توجد صور أو فيديوهات" />

    // Determine grid columns based on item count for better layout
    // For small number of items, keep standard grid. For many, use masonry-ish grid.
    return (
        <div className="grid grid-cols-3 gap-0.5">
            {items.map(item => (
                <div
                    key={item.id}
                    onClick={() => onPostClick(item)}
                    className="aspect-square relative bg-zinc-900 overflow-hidden cursor-pointer group"
                >
                    {item.mediaType === 'VIDEO' || item.mediaUrl.endsWith('.mp4') ? (
                        <video
                            src={item.mediaUrl + '#t=0.1'}
                            className="w-full h-full object-cover pointer-events-none"
                            preload="metadata"
                            muted
                            playsInline
                        />
                    ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={item.mediaUrl}
                            alt={item.caption || ''}
                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                            loading="lazy"
                        />
                    )}
                    <div className="absolute top-1 right-1 pointer-events-none">
                        {item._type === 'STORY' && <div className="bg-purple-600/80 rounded-full p-1"><Play className="w-3 h-3 text-white fill-white" /></div>}
                        {item.mediaType === 'VIDEO' && item._type === 'POST' && <div className="bg-black/50 rounded-full p-1"><Play className="w-3 h-3 text-white fill-white" /></div>}
                    </div>
                </div>
            ))}
        </div>
    )
}

function ListingsGrid({ items, type }: { items: TabListing[], type: 'PRODUCT' | 'REQUEST' }) {
    if (items.length === 0) return <EmptyState label={type === 'PRODUCT' ? 'لا توجد منتجات معروضة' : 'لا توجد طلبات شراء'} />

    return (
        <div className="grid grid-cols-2 gap-3 px-2">
            {items.map(item => (
                <Link
                    href={`/l/${item.id}`}
                    key={item.id}
                    className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 flex flex-col hover:border-zinc-600 transition-colors group"
                >
                    <div className="aspect-[4/3] bg-zinc-800 relative overflow-hidden">
                        <div className="w-full h-full flex items-center justify-center text-zinc-600 group-hover:scale-105 transition-transform duration-500">
                            {item.images ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={item.images} alt={item.title} className="w-full h-full object-cover" />
                            ) : (
                                type === 'PRODUCT' ? <ShoppingBag /> : <Megaphone />
                            )}
                        </div>
                        {type === 'PRODUCT' && (
                            <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded shadow-lg">
                                {item.price} د.م
                            </div>
                        )}
                    </div>
                    <div className="p-3">
                        <h4 className="text-sm font-bold text-white line-clamp-1 mb-1">{item.title}</h4>
                        <div className="w-full bg-zinc-800 hover:bg-zinc-700 text-xs text-white py-2 rounded transition-colors text-center mt-2 font-medium">
                            التفاصيل
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    )
}

function EmptyState({ label }: { label: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
            <div className="bg-zinc-900 p-4 rounded-full mb-4">
                <div className="text-4xl opacity-50">📂</div>
            </div>
            <p className="text-sm font-medium">{label}</p>
        </div>
    )
}
