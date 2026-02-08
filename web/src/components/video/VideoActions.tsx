'use client'

import { Heart, MessageCircle, Share2, MapPin, UserPlus } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { toggleLike } from '@/actions/interactions'
import { toast } from 'sonner'

interface VideoActionsProps {
    postId: string
    likes: number
    comments: number
    shares: number
    isLiked?: boolean
    className?: string
    location?: string
    author?: {
        name: string
        avatar?: string
        isShop?: boolean
    }
}

export function VideoActions({
    postId,
    likes = 0,
    comments = 0,
    shares = 0,
    isLiked = false,
    className,
    location,
    author
}: VideoActionsProps) {
    const [liked, setLiked] = useState(isLiked)
    const [likeCount, setLikeCount] = useState(likes)
    const [isLikeLoading, setIsLikeLoading] = useState(false)

    // Placeholder User ID (Replace with real Auth later)
    const userId = '1'

    const handleLike = async () => {
        if (isLikeLoading) return

        // Optimistic Update
        const previousState = liked
        const previousCount = likeCount

        setLiked(!liked)
        setLikeCount(prev => !liked ? prev + 1 : prev - 1)
        setIsLikeLoading(true)

        try {
            const result = await toggleLike(postId, userId)
            if (result.error) {
                throw new Error(result.error)
            }
        } catch (error) {
            // Revert if failed
            setLiked(previousState)
            setLikeCount(previousCount)
            toast.error('فشل تسجيل الإعجاب')
        } finally {
            setIsLikeLoading(false)
        }
    }

    const handleShare = async () => {
        try {
            await navigator.share({
                title: 'Social Commerce Video',
                url: window.location.href // Ideally specific video URL
            })
            toast.success('تمت المشاركة!')
        } catch (err) {
            console.log('Error sharing:', err)
            // Fallback like copying link
            navigator.clipboard.writeText(window.location.href)
            toast.success('تم نسخ الرابط!')
        }
    }

    return (
        <div className={cn("flex flex-col items-center gap-6", className)}>
            {/* Location Button (Specific request: Above Like) */}
            {location && (
                <div className="flex flex-col items-center gap-1 mb-2">
                    <motion.button
                        whileTap={{ scale: 0.8 }}
                        className="p-2 rounded-full bg-indigo-600/80 backdrop-blur-md text-white hover:bg-indigo-700/80 transition-colors shadow-lg"
                    >
                        <MapPin className="w-4 h-4" />
                    </motion.button>
                    <span className="text-white text-[9px] bg-black/50 px-1.5 py-0.5 rounded backdrop-blur-sm font-semibold drop-shadow-md max-w-[60px] truncate text-center">
                        {location}
                    </span>
                </div>
            )}

            {/* Like Button */}
            <div className="flex flex-col items-center gap-1">
                <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={handleLike}
                    disabled={isLikeLoading}
                    className={cn(
                        "p-3 rounded-full bg-black/40 backdrop-blur-md transition-colors",
                        liked ? "text-red-500" : "text-white hover:bg-black/60"
                    )}
                >
                    <Heart className={cn("w-7 h-7", liked && "fill-current")} />
                </motion.button>
                <span className="text-white text-xs font-semibold drop-shadow-md">{likeCount}</span>
            </div>

            {/* Comment Button */}
            <div className="flex flex-col items-center gap-1">
                <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={() => toast.info('التعليقات قادمة قريباً! 💬')}
                    className="p-3 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors"
                >
                    <MessageCircle className="w-7 h-7" />
                </motion.button>
                <span className="text-white text-xs font-semibold drop-shadow-md">{comments}</span>
            </div>

            {/* Share Button */}
            <div className="flex flex-col items-center gap-1">
                <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={handleShare}
                    className="p-3 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors"
                >
                    <Share2 className="w-7 h-7" />
                </motion.button>
                <span className="text-white text-xs font-semibold drop-shadow-md">{shares}</span>
            </div>

            {/* Author/Follow Button (Bottom) */}
            {author && (
                <div className="relative flex flex-col items-center gap-1 mt-2">
                    <motion.div
                        whileTap={{ scale: 0.9 }}
                        className="relative"
                    >
                        {author.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={author.avatar}
                                alt={author.name}
                                className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-lg"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full border-2 border-white bg-zinc-700 flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-xs">{author.name[0]}</span>
                            </div>
                        )}

                        {/* Plus/Follow Badge */}
                        <div className="absolute -bottom-1 -left-1 bg-red-500 rounded-full p-0.5 border border-white">
                            <UserPlus className="w-3 h-3 text-white" />
                        </div>
                    </motion.div>
                </div>
            )}


        </div>
    )
}
