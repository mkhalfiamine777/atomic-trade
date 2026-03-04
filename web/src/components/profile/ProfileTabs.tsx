'use client'

import { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Play, Clock, Image as ImageIcon } from 'lucide-react'
import { PostModal } from '@/components/post/PostModal'
import { getProfileContent } from '@/actions/getProfileContent'
import { TabStory, TabPost } from '@/types'
import { TabButton } from './tabs/TabButton'
import { MediaGrid } from './tabs/MediaGrid'
import { InfiniteScrollSentinel } from './tabs/InfiniteScrollSentinel'

interface Props {
    userId: string
    initialStories: TabStory[]
    initialVideos: TabPost[]
    initialImages: TabPost[]
    initialTab?: TabType
}

type TabType = 'VIDEOS' | 'STORIES' | 'IMAGES'

export function ProfileTabs({ userId, initialStories, initialVideos, initialImages, initialTab }: Props) {
    const [activeTab, setActiveTab] = useState<TabType>(initialTab || 'VIDEOS')
    const [selectedPost, setSelectedPost] = useState<TabPost | null>(null)

    // State for Data
    const [videos, setVideos] = useState<TabPost[]>(initialVideos)
    const [images, setImages] = useState<TabPost[]>(initialImages)

    // State for Pagination
    const [videosPage, setVideosPage] = useState(1)
    const [imagesPage, setImagesPage] = useState(1)

    const [hasMoreVideos, setHasMoreVideos] = useState(initialVideos.length === 12)
    const [hasMoreImages, setHasMoreImages] = useState(initialImages.length === 12)

    const [isLoading, setIsLoading] = useState(false)

    const loadMore = useCallback(async () => {
        if (isLoading) return
        setIsLoading(true)

        try {
            if (activeTab === 'VIDEOS') {
                const nextPage = videosPage + 1
                const res = await getProfileContent(userId, 'VIDEOS', nextPage)
                if (res.success && res.data) {
                    setVideos(prev => {
                        const newItems = res.data
                            .map((p: any) => ({
                                id: p.id,
                                mediaUrl: p.mediaUrl,
                                mediaType: p.mediaType,
                                caption: p.caption
                            }))
                            .filter((p: TabPost) => !prev.some(existing => existing.id === p.id))
                        return [...prev, ...newItems]
                    })
                    setVideosPage(nextPage)
                    setHasMoreVideos(res.hasMore)
                } else {
                    setHasMoreVideos(false)
                }
            } else if (activeTab === 'IMAGES') {
                const nextPage = imagesPage + 1
                const res = await getProfileContent(userId, 'IMAGES', nextPage)
                if (res.success && res.data) {
                    setImages(prev => {
                        const newItems = res.data
                            .map((p: any) => ({
                                id: p.id,
                                mediaUrl: p.mediaUrl,
                                mediaType: p.mediaType,
                                caption: p.caption
                            }))
                            .filter((p: TabPost) => !prev.some(existing => existing.id === p.id))
                        return [...prev, ...newItems]
                    })
                    setImagesPage(nextPage)
                    setHasMoreImages(res.hasMore)
                } else {
                    setHasMoreImages(false)
                }
            }
        } catch (error) {
            console.error("Failed to load more", error)
        } finally {
            setIsLoading(false)
        }
    }, [activeTab, isLoading, userId, videosPage, imagesPage])

    return (
        <div className="w-full">
            {/* Sticky Tabs Header */}
            <div className="sticky top-0 z-20 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5 -mx-2 sm:-mx-4 px-2 sm:px-4">
                <div className="flex relative">
                    <TabButton
                        isActive={activeTab === 'VIDEOS'}
                        onClick={() => setActiveTab('VIDEOS')}
                        icon={<Play className="w-4 h-4" />}
                        label="فيديوهات"
                        count={videos.length}
                    />
                    <TabButton
                        isActive={activeTab === 'STORIES'}
                        onClick={() => setActiveTab('STORIES')}
                        icon={<Clock className="w-4 h-4" />}
                        label="ستوريات"
                        count={initialStories.length}
                    />
                    <TabButton
                        isActive={activeTab === 'IMAGES'}
                        onClick={() => setActiveTab('IMAGES')}
                        icon={<ImageIcon className="w-4 h-4" />}
                        label="صور وملصقات"
                        count={images.length}
                    />
                </div>
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="min-h-[200px] flex flex-col gap-4 mt-4"
                >
                    {activeTab === 'VIDEOS' && (
                        <>
                            <MediaGrid
                                stories={[]}
                                posts={videos}
                                onPostClick={(post) => setSelectedPost(post)}
                            />
                            <InfiniteScrollSentinel
                                onIntersect={loadMore}
                                hasMore={hasMoreVideos}
                                isLoading={isLoading}
                            />
                        </>
                    )}
                    {activeTab === 'STORIES' && (
                        <>
                            <MediaGrid
                                stories={initialStories}
                                posts={[]}
                                onPostClick={(post) => setSelectedPost(post)}
                            />
                        </>
                    )}
                    {activeTab === 'IMAGES' && (
                        <>
                            <MediaGrid
                                stories={[]}
                                posts={images}
                                onPostClick={(post) => setSelectedPost(post)}
                            />
                            <InfiniteScrollSentinel
                                onIntersect={loadMore}
                                hasMore={hasMoreImages}
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
