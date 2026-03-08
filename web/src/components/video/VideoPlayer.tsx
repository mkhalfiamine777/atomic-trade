'use client'

import { useRef, useEffect, useState } from 'react'
import { Play, Pause, Volume2, VolumeX, Coins, Maximize2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { awardCoinsForWatch } from '@/actions/earnCoins'
import { toast } from 'sonner'
import { useLightboxStore } from '@/store/useLightboxStore'
import { motion } from 'framer-motion'

interface VideoPlayerProps {
    src: string
    isActive?: boolean
    className?: string
    poster?: string
    postId?: string // For Watch-to-Earn
    onEnd?: () => void // For Session Watch Tracking
}

export function VideoPlayer({
    src,
    isActive = false,
    className,
    poster,
    postId,
    onEnd
}: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isMuted, setIsMuted] = useState(true)
    const [hasEarned, setHasEarned] = useState(false)
    const { openLightbox } = useLightboxStore()

    // Handle auto-play when active
    useEffect(() => {
        if (isActive) {
            videoRef.current?.play().catch(() => {
                // Auto-play failed (usually due to browser policy)
                setIsMuted(true) // Ensure muted to try again

                // Retry playing after UI updates to muted state
                setTimeout(() => {
                    if (videoRef.current) {
                        videoRef.current.muted = true
                        videoRef.current.play().catch(e => console.warn("Autoplay completely blocked:", e))
                    }
                }, 100)
            })
            setIsPlaying(true)
        } else {
            videoRef.current?.pause()
            setIsPlaying(false)
            if (videoRef.current) {
                videoRef.current.currentTime = 0 // Reset when inactive
            }
        }
    }, [isActive])

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause()
            } else {
                videoRef.current.play()
            }
            setIsPlaying(!isPlaying)
        }
    }

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (videoRef.current) {
            videoRef.current.muted = !isMuted
            setIsMuted(!isMuted)
        }
    }

    const handleVideoEnd = async () => {
        setIsPlaying(false)
        if (onEnd) onEnd() // Trigger session track

        if (postId && !hasEarned) {
            try {
                const res = await awardCoinsForWatch(postId)
                if (res.success && res.coinsEarned) {
                    setHasEarned(true)
                    toast.success(res.message, {
                        icon: <Coins className="text-yellow-400 w-5 h-5 animate-pulse" />,
                        duration: 4000
                    })
                }
            } catch (error) {
                console.error("Failed to unlock watch reward", error)
            }
        }
    }

    return (
        <motion.div
            layoutId={src}
            className={cn("relative w-full h-full bg-black cursor-pointer group", className)}
            onClick={togglePlay}
        >
            <video
                ref={videoRef}
                src={src}
                className="w-full h-full object-cover"
                loop={!postId} // If it's a monetized video, pause at end to show reward state. Otherwise loop.
                muted={isMuted}
                playsInline
                poster={poster}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={handleVideoEnd}
            />

            {/* Play/Pause Overlay Icon */}
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Play className="w-16 h-16 text-white/80 fill-current" />
                </div>
            )}

            {/* Controls Overlay */}
            <div className="absolute bottom-4 right-4 z-20 flex gap-2">
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        // Pause the video before expanding
                        if (isPlaying) {
                            videoRef.current?.pause()
                            setIsPlaying(false)
                        }
                        openLightbox(src, src)
                    }}
                    className="p-2 bg-black/40 rounded-full text-white hover:bg-black/60 transition-colors backdrop-blur-md opacity-0 group-hover:opacity-100"
                    title="مشاهدة وتكبير"
                >
                    <Maximize2 className="w-5 h-5" />
                </button>
                <button
                    onClick={toggleMute}
                    className="p-2 bg-black/40 rounded-full text-white hover:bg-black/60 transition-colors backdrop-blur-md"
                    title="كتم الصوت"
                >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
            </div>

            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
        </motion.div>
    )
}
