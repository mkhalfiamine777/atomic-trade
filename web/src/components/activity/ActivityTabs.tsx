'use client'

import { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ShoppingBag, Megaphone } from 'lucide-react'
import { getProfileContent } from '@/actions/getProfileContent'
import { TabListing } from '@/types'
import { TabButton } from '@/components/profile/tabs/TabButton'
import { ListingsGrid } from '@/components/profile/tabs/ListingsGrid'
import { InfiniteScrollSentinel } from '@/components/profile/tabs/InfiniteScrollSentinel'
import { AddProductModal } from '@/components/modals/AddProductModal'

interface Props {
    userId: string
    initialProducts: TabListing[]
    isOwner?: boolean // لمعرفة ما إذا كان الزائر هو مالك المتجر
}

export function ActivityTabs({ userId, initialProducts, isOwner }: Props) {
    const activeTab = 'SALES'

    // State for Data
    const [products, setProducts] = useState<TabListing[]>(initialProducts)

    // State for Modals
    const [isAddProductMode, setIsAddProductMode] = useState(false)

    // State for Pagination
    const [salesPage, setSalesPage] = useState(1)
    const [hasMoreSales, setHasMoreSales] = useState(initialProducts.length === 24)
    const [isLoading, setIsLoading] = useState(false)

    const loadMore = useCallback(async () => {
        if (isLoading) return
        setIsLoading(true)

        try {
            const nextPage = salesPage + 1
            const res = await getProfileContent(userId, 'SALES', nextPage)
            if (res.success && res.data) {
                setProducts(prev => {
                    const newProducts = res.data
                        .map((l: any) => ({
                            id: l.id,
                            title: l.title,
                            price: l.price,
                            images: l.images,
                            isSold: l.isSold,
                            soldAt: l.soldAt
                        }))
                        .filter((l: TabListing) => !prev.some(existing => existing.id === l.id))
                    return [...prev, ...newProducts]
                })
                setSalesPage(nextPage)
                setHasMoreSales(res.hasMore)
            } else {
                setHasMoreSales(false)
            }
        } catch (error) {
            console.error("Failed to load more", error)
        } finally {
            setIsLoading(false)
        }
    }, [isLoading, userId, salesPage])

    return (
        <div className="w-full">
            {/* Sticky Header - Virtual Shelves */}
            <div className="sticky top-0 z-20 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5 -mx-2 sm:-mx-4 px-2 sm:px-4 py-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-bold text-white">رفوف المتجر الافتراضية</h2>
                <div className="mr-auto bg-white/10 px-3 py-1 rounded-full text-sm font-medium">
                    {products.length} منتج
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
                    className="min-h-[200px] flex flex-col gap-6 mt-6 pb-20"
                >
                    {isOwner && (
                        <div className="w-full">
                            <button
                                className="w-full relative group overflow-hidden rounded-2xl border-2 border-dashed border-zinc-700 hover:border-amber-500 hover:bg-amber-500/10 transition-all duration-300 py-8 flex flex-col items-center justify-center gap-3 backdrop-blur-sm bg-zinc-900/40 cursor-pointer"
                                onClick={() => setIsAddProductMode(true)}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-500/20 transition-all duration-300 shadow-lg border border-white/5">
                                    <span className="text-2xl text-amber-500">+</span>
                                </div>
                                <div className="text-center">
                                    <span className="block text-zinc-300 font-bold text-lg mb-1 group-hover:text-amber-500 transition-colors">ضع منتجاً جديداً على الرف</span>
                                    <span className="text-xs text-zinc-500 group-hover:text-amber-500/70 transition-colors">اجعل متجرك ينبض بالحياة، الزبائن يتصفحون الآن!</span>
                                </div>
                            </button>
                        </div>
                    )}
                    
                    <ListingsGrid items={products} type="PRODUCT" isOwner={isOwner} />
                    
                    <InfiniteScrollSentinel
                        onIntersect={loadMore}
                        hasMore={hasMoreSales}
                        isLoading={isLoading}
                    />
                </motion.div>
            </AnimatePresence>

            {isOwner && (
                <AddProductModal
                    isOpen={isAddProductMode}
                    onClose={() => setIsAddProductMode(false)}
                    onSuccess={() => {
                        setIsAddProductMode(false)
                        window.location.reload() // Force a reload to show the new product instantly on the shelf
                    }}
                />
            )}
        </div>
    )
}
