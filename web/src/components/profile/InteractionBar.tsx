'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { ThumbsUp, Heart, MessageCircle } from 'lucide-react'
import { interactWithUser, interactWithListing } from '@/actions/interactions'

interface Props {
    // For posts/generic usage
    initialLikes?: number
    initialLoves?: number
    commentsCount?: number
    onInteract?: (type: 'LIKE' | 'LOVE' | 'COMMENT') => void
    // For profile interactions
    targetUserId?: string
    currentUserId?: string
    // For listing interaction
    listingId?: string
}

export function InteractionBar({
    initialLikes = 0,
    initialLoves = 0,
    commentsCount = 0,
    onInteract,
    targetUserId,
    currentUserId,
    listingId
}: Props) {
    const [likes, setLikes] = useState(initialLikes)
    const [loves, setLoves] = useState(initialLoves)
    const [hasLiked, setHasLiked] = useState(false)
    const [hasLoved, setHasLoved] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleLike = async () => {
        if (hasLiked) return

        // If profile interaction
        if (targetUserId && currentUserId) {
            setIsLoading(true)
            const result = await interactWithUser(targetUserId, 'LIKE')
            setIsLoading(false)
            if (result.success) {
                setLikes(prev => prev + 1)
                setHasLiked(true)
            }
            return
        }

        // If listing interaction
        if (listingId && currentUserId) {
            setIsLoading(true)
            const result = await interactWithListing(listingId, 'LIKE')
            setIsLoading(false)
            if (result.success) {
                if (result.action === 'added') {
                    setLikes(prev => prev + 1)
                    setHasLiked(true)
                } else {
                    setLikes(prev => prev - 1)
                    setHasLiked(false)
                }
            }
            return
        }

        // Generic callback (if no IDs provided)
        setLikes(prev => prev + 1)
        setHasLiked(true)
        onInteract?.('LIKE')
    }

    const handleLove = async () => {
        if (hasLoved) return

        // If profile interaction
        if (targetUserId && currentUserId) {
            setIsLoading(true)
            const result = await interactWithUser(targetUserId, 'LOVE')
            setIsLoading(false)
            if (result.success) {
                setLoves(prev => prev + 1)
                setHasLoved(true)
                toast.success('أرسلت الكثير من الحب! ❤️')
            }
            return
        }

        // If listing interaction
        if (listingId && currentUserId) {
            setIsLoading(true)
            const result = await interactWithListing(listingId, 'LOVE')
            setIsLoading(false)
            if (result.success) {
                if (result.action === 'added') {
                    setLoves(prev => prev + 1)
                    setHasLoved(true)
                    toast.success('أرسلت الكثير من الحب! ❤️')
                } else {
                    setLoves(prev => prev - 1)
                    setHasLoved(false)
                }
            }
            return
        }

        // Generic callback
        setLoves(prev => prev + 1)
        setHasLoved(true)
        onInteract?.('LOVE')
        toast.success('أرسلت الكثير من الحب! ❤️')
    }

    return (
        <div className="flex items-center justify-around bg-zinc-900/80 backdrop-blur-md rounded-full px-6 py-3 border border-zinc-800 shadow-xl max-w-sm mx-auto mt-4">
            {/* Like Button */}
            <button
                onClick={handleLike}
                disabled={isLoading}
                className={`flex flex-col items-center gap-1 transition-transform active:scale-90 disabled:opacity-50 ${hasLiked ? 'text-blue-500' : 'text-zinc-400 hover:text-white'}`}
            >
                <ThumbsUp className={`w-6 h-6 ${hasLiked ? 'fill-blue-500' : ''}`} />
                <span className="text-xs font-bold">{likes}</span>
            </button>

            {/* Love Button */}
            <button
                onClick={handleLove}
                disabled={isLoading}
                className={`flex flex-col items-center gap-1 transition-transform active:scale-90 disabled:opacity-50 ${hasLoved ? 'text-pink-500' : 'text-zinc-400 hover:text-pink-500'}`}
            >
                <Heart className={`w-6 h-6 ${hasLoved ? 'fill-pink-500' : ''}`} />
                <span className="text-xs font-bold">{loves}</span>
            </button>

            {/* Comment Button */}
            <button
                onClick={() => onInteract?.('COMMENT')}
                className="flex flex-col items-center gap-1 text-zinc-400 hover:text-white transition-opacity"
            >
                <MessageCircle className="w-6 h-6" />
                <span className="text-xs font-bold">{commentsCount}</span>
            </button>
        </div>
    )
}

