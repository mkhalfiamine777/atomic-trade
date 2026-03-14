'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, Megaphone, Clock, Sparkles, Store, MessageCircle, Flame, Heart } from 'lucide-react'
import type { FeedItemDTO } from '@/actions/feed'
import { interactWithListing } from '@/actions/interactions'

interface ListingFeedCardProps {
    item: FeedItemDTO
    isActive: boolean
    isGhost?: boolean
    videosNeededForUnlock?: number
}

/**
 * 🛍️ Listing Feed Card — Full-screen shoppable card for the Explore feed
 * Supports both normal Listings, 🎰 Golden Deal cards, and 👻 Ghost Products
 */
export function ListingFeedCard({ item, isActive, isGhost = false, videosNeededForUnlock = 0 }: ListingFeedCardProps) {
    const isGolden = item.isGoldenDeal === true
    const isRequest = item.listingType === 'REQUEST'

    // 📉 Crowd Price Drop Local State
    const [isLiked, setIsLiked] = useState<boolean>(item.isLiked)
    const [currentLikes, setCurrentLikes] = useState<number>(item.likes || 0)
    const [currentPrice, setCurrentPrice] = useState<number | null | undefined>(item.price)
    const [isDropping, setIsDropping] = useState(false) // Confetti/Drop effect state

    const crowdTarget = item.crowdTarget || 0
    const crowdDiscount = item.crowdDiscount || 0
    const isCrowdDropActive = crowdTarget > 0

    const progressPercentage = crowdTarget > 0 ? Math.min(100, Math.round((currentLikes / crowdTarget) * 100)) : 0

    // 🎰 Golden Deal Countdown
    const [timeLeft, setTimeLeft] = useState(0)
    const [expired, setExpired] = useState(false)

    useEffect(() => {
        if (!isGolden || !item.dealExpiresAt) return

        const update = () => {
            const diff = new Date(item.dealExpiresAt!).getTime() - Date.now()
            if (diff <= 0) {
                setTimeLeft(0)
                setExpired(true)
            } else {
                setTimeLeft(Math.ceil(diff / 1000))
            }
        }

        update()
        const interval = setInterval(update, 1000)
        return () => clearInterval(interval)
    }, [isGolden, item.dealExpiresAt])

    return (
        <div className="w-full h-full relative overflow-hidden">
            {/* Background Image (Blurred + Focused) */}
            <div className="absolute inset-0">
                <Image
                    src={item.url}
                    alt={item.title || ''}
                    fill
                    className="object-cover scale-110 blur-xl opacity-40"
                />
            </div>

            {/* ✨ Golden Deal border effect */}
            {isGolden && !expired && (
                <div className="absolute inset-0 z-10 pointer-events-none rounded-none"
                    style={{
                        boxShadow: 'inset 0 0 80px rgba(255, 215, 0, 0.3), inset 0 0 200px rgba(255, 165, 0, 0.1)',
                        border: '2px solid rgba(255, 215, 0, 0.4)',
                    }}
                />
            )}

            {/* 🎊 Price Drop Confetti / Success Overlay */}
            {isDropping && (
                <div className="absolute inset-0 z-[60] flex items-center justify-center bg-emerald-500/20 backdrop-blur-sm animate-in fade-in duration-500 pointer-events-none">
                    <div className="bg-emerald-500 text-white font-black text-4xl px-8 py-4 rounded-3xl shadow-[0_0_100px_rgba(16,185,129,1)] scale-150 animate-bounce">
                        انخفض السعر! 🎉
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="relative z-20 w-full h-full flex flex-col items-center justify-center px-6">

                {/* 🎰 Golden Deal Badge + Timer */}
                {isGolden && !expired && (
                    <div className="absolute top-6 left-0 right-0 flex flex-col items-center gap-2 animate-pulse">
                        <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-500/90 to-amber-600/90 backdrop-blur-md px-5 py-2 rounded-full shadow-lg shadow-yellow-500/30">
                            <Sparkles className="w-5 h-5 text-white" />
                            <span className="text-white font-black text-sm tracking-wide">كنز مخفي!</span>
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex items-center gap-1.5 bg-red-600/90 backdrop-blur-sm px-4 py-1.5 rounded-full">
                            <Clock className="w-4 h-4 text-white" />
                            <span className="text-white font-mono font-bold text-lg tabular-nums">{timeLeft}s</span>
                        </div>
                    </div>
                )}

                {isGolden && expired && (
                    <div className="absolute top-6 left-0 right-0 flex justify-center">
                        <div className="bg-zinc-800/80 backdrop-blur-md px-5 py-2 rounded-full">
                            <span className="text-zinc-400 font-bold text-sm">⏰ انتهى العرض</span>
                        </div>
                    </div>
                )}

                {/* 👻 Ghost Product Lock Overlay */}
                {isGhost && videosNeededForUnlock > 0 && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xl p-8 text-center">
                        <div className="bg-indigo-600/20 w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(79,70,229,0.5)]">
                            <Store className="w-10 h-10 text-indigo-400 animate-pulse" />
                        </div>
                        <h2 className="text-white text-3xl font-black mb-3 text-shadow-lg">منتج حصري مقفل 🔒</h2>
                        <p className="text-zinc-300 text-lg mb-8 leading-relaxed max-w-xs mx-auto">
                            هذا المنتج النادر يحتوي على خصم استثنائي. لا يمكنك رؤيته حتى تثبت نشاطك!
                        </p>

                        <div className="bg-zinc-900/80 border border-indigo-500/30 rounded-2xl p-4 w-full max-w-xs shadow-2xl">
                            <p className="text-indigo-400 font-bold mb-2">المهمة الحالية:</p>
                            <div className="flex items-center justify-center gap-2 text-white">
                                <Flame className="w-5 h-5 text-orange-500" />
                                <span>شاهد <strong className="text-xl text-orange-400">{videosNeededForUnlock}</strong> فيديوهات إضافية</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Product Image */}
                <div className={`relative rounded-3xl overflow-hidden shadow-2xl ${isGolden && !expired ? 'ring-4 ring-yellow-400/60 shadow-yellow-500/30' : 'ring-1 ring-white/10'}`}
                    style={{ width: '85%', maxWidth: '340px', aspectRatio: '3/4' }}
                >
                    <Image
                        src={item.url}
                        alt={item.title || ''}
                        fill
                        priority
                        className="object-cover"
                    />

                    {/* Type Badge */}
                    <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md border shadow-lg ${isRequest
                        ? 'bg-purple-500/80 border-purple-400/40 text-white shadow-purple-500/20'
                        : 'bg-emerald-500/80 border-emerald-400/40 text-white shadow-emerald-500/20'
                        }`}>
                        {isRequest ? <Megaphone className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
                        {isRequest ? 'طلب' : 'منتج'}
                    </div>

                    {/* Price Badge */}
                    {currentPrice != null && (
                        <div className={`absolute bottom-3 left-3 px-4 py-2 rounded-2xl font-black text-lg backdrop-blur-md border transition-all duration-700 ${isDropping ? 'scale-125 bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.8)] border-emerald-400'
                            : isGolden && !expired
                                ? 'bg-gradient-to-r from-yellow-500/90 to-amber-500/90 border-yellow-400/40 text-white shadow-lg shadow-yellow-500/30'
                                : 'bg-black/80 border-white/20 text-emerald-400'
                            }`}>
                            {item.price !== currentPrice && (
                                <span className="line-through text-zinc-400 text-sm mr-2">{item.price}</span>
                            )}
                            {currentPrice} د.م
                        </div>
                    )}

                    {/* Viewers Count (Social Proof) */}
                    {isGolden && !expired && (
                        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-red-600/80 backdrop-blur-sm px-2.5 py-1 rounded-full">
                            <Flame className="w-3 h-3 text-white" />
                            <span className="text-white text-[10px] font-bold">
                                {Math.floor(Math.random() * 8) + 2} يشاهدون الآن
                            </span>
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="w-full max-w-[340px] mt-5 text-center" dir="rtl">
                    <h2 className="text-white font-bold text-xl leading-tight mb-2 line-clamp-2">
                        {item.title || item.description}
                    </h2>

                    {/* Seller Info */}
                    <div className="flex items-center justify-center gap-2 mb-5">
                        {item.userAvatar && (
                            <Image src={item.userAvatar} width={24} height={24} className="rounded-full object-cover border border-white/20" alt={item.username || 'صورة البائع'} />
                        )}
                        <span className="text-zinc-400 text-sm">{item.username}</span>
                        {item.isShop && <span className="text-[9px] bg-indigo-500/80 text-white px-1.5 py-0.5 rounded">متجر</span>}
                    </div>

                    {/* 📉 Crowd Price Drop Progress Bar */}
                    {isCrowdDropActive && (
                        <div className="w-full bg-black/60 backdrop-blur-md border border-rose-500/30 rounded-2xl p-4 mb-4 shadow-[0_0_20px_rgba(244,63,94,0.15)] relative overflow-hidden">
                            <div className="flex justify-between items-end mb-2 relative z-10">
                                <span className="text-rose-400 font-bold text-sm tracking-wide">🔥 تعاون لتخفيض السعر {crowdDiscount}%</span>
                                <span className="text-white font-mono font-bold text-sm bg-rose-500/20 px-2 py-0.5 rounded-md">{currentLikes}/{crowdTarget}</span>
                            </div>
                            {/* Progress Track */}
                            <div className="w-full bg-zinc-800 rounded-full h-3.5 relative overflow-hidden ring-1 ring-white/10">
                                {/* Progress Fill */}
                                <div
                                    className="bg-gradient-to-r from-rose-600 to-orange-500 h-full rounded-full transition-all duration-700 ease-out relative"
                                    style={{ width: `${progressPercentage}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
                                </div>
                            </div>
                            <p className="text-[10px] text-zinc-400 mt-2 text-center relative z-10">اضغط إعجاب وشارك المنتج مع أصدقائك للوصول للهدف!</p>
                        </div>
                    )}

                    {/* CTA Layout (Like + Contact) */}
                    <div className="flex gap-2.5 w-full mb-2.5">
                        {/* Like Button */}
                        <button
                            aria-label={isLiked ? "إلغاء الإعجاب" : "إعجاب"}
                            onClick={async () => {
                                const newLiked = !isLiked
                                setIsLiked(newLiked)
                                setCurrentLikes(prev => newLiked ? prev + 1 : prev - 1)

                                const res = await interactWithListing(item.id, 'LIKE')
                                if (res?.success) {
                                    if (res.priceDropped && res.newPrice) {
                                        setIsDropping(true)
                                        setCurrentPrice(res.newPrice)
                                        setCurrentLikes(res.currentLikes || currentLikes + 1)
                                        setTimeout(() => setIsDropping(false), 4000)
                                    }
                                } else {
                                    // Revert on error
                                    setIsLiked(!newLiked)
                                    setCurrentLikes(prev => !newLiked ? prev + 1 : prev - 1)
                                }
                            }}
                            className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all shadow-lg ${isLiked
                                ? 'bg-rose-500/20 border border-rose-500/50 text-rose-500 shadow-rose-500/20'
                                : 'bg-white/10 border border-white/10 text-white hover:bg-white/20'
                                }`}
                            style={{ flex: '0 0 auto', minWidth: '70px' }}
                        >
                            <Heart className={`w-6 h-6 mb-1 ${isLiked ? 'fill-current animate-pulse' : ''}`} />
                            <span className="text-xs font-bold font-mono">{currentLikes}</span>
                        </button>

                        <button className={`flex-1 py-3.5 rounded-2xl font-bold text-base transition-all shadow-lg ${isGolden && !expired
                            ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black shadow-yellow-500/30 hover:shadow-yellow-500/50'
                            : 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-indigo-500/30 hover:shadow-indigo-500/50'
                            }`}>
                            <div className="flex items-center justify-center gap-2">
                                <MessageCircle className="w-5 h-5" />
                                {isGolden && !expired ? 'اغتنم الفرصة الآن!' : 'تواصل مع البائع'}
                            </div>
                        </button>
                    </div>
                    {item.sellerUsername && (
                        <Link
                            href={`/activity/${item.sellerUsername}`}
                            className="w-full py-3 rounded-2xl font-medium text-sm bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 hover:text-white border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2"
                        >
                            <Store className="w-4 h-4" />
                            زيارة المتجر
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}
