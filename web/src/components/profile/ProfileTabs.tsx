'use client'

import { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ShoppingBag, Megaphone, Image as ImageIcon } from 'lucide-react'
import { PostModal } from '@/components/post/PostModal'
import { getProfileContent } from '@/actions/getProfileContent'
import { TabStory, TabListing, TabPost } from '@/types'
import { TabButton } from './tabs/TabButton'
import { MediaGrid } from './tabs/MediaGrid'
import { ListingsGrid } from './tabs/ListingsGrid'
import { InfiniteScrollSentinel } from './tabs/InfiniteScrollSentinel'

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
                                id: p.id,
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
