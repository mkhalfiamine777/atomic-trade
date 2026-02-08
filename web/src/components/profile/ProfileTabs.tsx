'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, ShoppingBag, Megaphone, Image as ImageIcon } from 'lucide-react'

// Define unified types for the view
export interface TabStory {
    id: string
    mediaUrl: string
    mediaType: string
    caption?: string | null
}

export interface TabListing {
    id: string
    title: string
    price: number
    images: string // simplified for now, assuming comma separated or single url
}

export interface TabPost {
    id: string
    mediaUrl: string
    mediaType: string
    caption?: string | null
}

interface Props {
    stories: TabStory[]
    posts: TabPost[]
    products: TabListing[]
    requests: TabListing[]
}

type TabType = 'MEDIA' | 'SALES' | 'REQUESTS'

export function ProfileTabs({ stories, posts, products, requests }: Props) {
    // Determine default tab based on content
    const getInitialTab = (): TabType => {
        if (products.length > 0) return 'SALES'
        if (requests.length > 0) return 'REQUESTS'
        return 'MEDIA'
    }

    const [activeTab, setActiveTab] = useState<TabType>(getInitialTab())

    const mediaCount = stories.length + posts.length
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
                    className="min-h-[200px]"
                >
                    {activeTab === 'MEDIA' && (
                        <MediaGrid stories={stories} posts={posts} />
                    )}
                    {activeTab === 'SALES' && (
                        <ListingsGrid items={products} type="PRODUCT" />
                    )}
                    {activeTab === 'REQUESTS' && (
                        <ListingsGrid items={requests} type="REQUEST" />
                    )}
                </motion.div>
            </AnimatePresence>
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

function MediaGrid({ stories, posts }: { stories: TabStory[], posts: TabPost[] }) {
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

    const items = [...storyItems, ...postItems]

    if (items.length === 0) return <EmptyState label="لا توجد صور أو فيديوهات" />

    return (
        <div className="grid grid-cols-3 gap-1">
            {items.map(item => (
                <div key={item.id} className="aspect-square relative bg-zinc-900 overflow-hidden cursor-pointer group">
                    {item.mediaType === 'VIDEO' || item.mediaUrl.endsWith('.mp4') ? (
                        <video src={item.mediaUrl + '#t=0.1'} className="w-full h-full object-cover" muted playsInline />
                    ) : (
                        <img src={item.mediaUrl} alt={item.caption || ''} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    )}

                    {/* Type Badge */}
                    <div className="absolute top-1 right-1 pointer-events-none">
                        {item._type === 'STORY' && <div className="bg-purple-600/80 rounded-full p-1"><Play className="w-3 h-3 text-white fill-white" /></div>}
                        {item.mediaType === 'VIDEO' && item._type === 'POST' && <div className="bg-black/50 rounded-full p-1"><Play className="w-3 h-3 text-white fill-white" /></div>}
                    </div>

                    {/* View Count Overlay (Optional Future) */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                        {/* <span className="text-[10px] text-white flex items-center gap-1"><Play size={10} /> 1.2k</span> */}
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
                <div key={item.id} className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 flex flex-col">
                    <div className="aspect-[4/3] bg-zinc-800 relative">
                        {/* Placeholder for now if no images parsed correctly */}
                        <div className="w-full h-full flex items-center justify-center text-zinc-600">
                            {type === 'PRODUCT' ? <ShoppingBag /> : <Megaphone />}
                        </div>
                        {type === 'PRODUCT' && (
                            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded">
                                {item.price} د.م
                            </div>
                        )}
                    </div>
                    <div className="p-3">
                        <h4 className="text-sm font-bold text-white line-clamp-1 mb-1">{item.title}</h4>
                        <button className="w-full bg-zinc-800 hover:bg-zinc-700 text-xs text-white py-2 rounded transition-colors">
                            التفاصيل
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
}

function EmptyState({ label }: { label: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
            <div className="text-4xl mb-4 opacity-50">📂</div>
            <p className="text-sm">{label}</p>
        </div>
    )
}
