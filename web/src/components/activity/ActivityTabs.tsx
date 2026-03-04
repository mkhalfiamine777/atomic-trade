'use client'

import { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ShoppingBag, Megaphone } from 'lucide-react'
import { getProfileContent } from '@/actions/getProfileContent'
import { TabListing } from '@/types'
import { TabButton } from '@/components/profile/tabs/TabButton'
import { ListingsGrid } from '@/components/profile/tabs/ListingsGrid'
import { InfiniteScrollSentinel } from '@/components/profile/tabs/InfiniteScrollSentinel'

interface Props {
    userId: string
    initialProducts: TabListing[]
    initialRequests: TabListing[]
    initialTab?: TabType
}

type TabType = 'SALES' | 'REQUESTS'

export function ActivityTabs({ userId, initialProducts, initialRequests, initialTab }: Props) {
    const [activeTab, setActiveTab] = useState<TabType>(initialTab || 'SALES')

    // State for Data
    const [products, setProducts] = useState<TabListing[]>(initialProducts)
    const [requests, setRequests] = useState<TabListing[]>(initialRequests)

    // State for Pagination
    const [salesPage, setSalesPage] = useState(1)
    const [requestsPage, setRequestsPage] = useState(1)

    const [hasMoreSales, setHasMoreSales] = useState(initialProducts.length === 12)
    const [hasMoreRequests, setHasMoreRequests] = useState(initialRequests.length === 12)

    const [isLoading, setIsLoading] = useState(false)

    const loadMore = useCallback(async () => {
        if (isLoading) return
        setIsLoading(true)

        try {
            if (activeTab === 'SALES') {
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
    }, [activeTab, isLoading, userId, salesPage, requestsPage])

    return (
        <div className="w-full">
            {/* Sticky Tabs Header */}
            <div className="sticky top-0 z-20 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5 -mx-2 sm:-mx-4 px-2 sm:px-4">
                <div className="flex relative">
                    <TabButton
                        isActive={activeTab === 'SALES'}
                        onClick={() => setActiveTab('SALES')}
                        icon={<ShoppingBag className="w-4 h-4" />}
                        label="المنتجات"
                        count={products.length}
                    />
                    <TabButton
                        isActive={activeTab === 'REQUESTS'}
                        onClick={() => setActiveTab('REQUESTS')}
                        icon={<Megaphone className="w-4 h-4" />}
                        label="الطلبات"
                        count={requests.length}
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
        </div>
    )
}
