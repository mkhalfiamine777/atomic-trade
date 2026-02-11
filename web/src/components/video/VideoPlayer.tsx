'use client'

import { useRef, useEffect, useState } from 'react'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VideoPlayerProps {
    src: string
    isActive?: boolean
    className?: string
    poster?: string
}

export function VideoPlayer({
    src,
    isActive = false,
    className,
    poster
}: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isMuted, setIsMuted] = useState(true)

    // Handle auto-play when active
    useEffect(() => {
        if (isActive) {
            videoRef.current?.play().catch(() => {
                // Auto-play failed (usually due to browser policy)
                setIsMuted(true) // Ensure muted to try again
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

    return (
        <div
            className={cn("relative w-full h-full bg-black cursor-pointer group", className)}
            onClick={togglePlay}
        >
            <video
                ref={videoRef}
                src={src}
                className="w-full h-full object-cover"
                loop
                muted={isMuted}
                playsInline
                poster={poster}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
            />

            {/* Play/Pause Overlay Icon */}
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Play className="w-16 h-16 text-white/80 fill-current" />
                </div>
            )}

            {/* Controls Overlay */}
            <div className="absolute bottom-4 right-4 z-20">
                <button
                    onClick={toggleMute}
                    className="p-2 bg-black/40 rounded-full text-white hover:bg-black/60 transition-colors backdrop-blur-md"
                >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
            </div>

            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
        </div>
    )
}
