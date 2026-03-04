'use client'

import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { VideoActions } from './VideoActions'

interface ImageViewerProps {
    src: string
    alt?: string
    isActive?: boolean
    className?: string
    caption?: string
    username: string
    userAvatar?: string
    likes?: number
    comments?: number
    shares?: number
    isLiked?: boolean
    location?: string
    isShop?: boolean
    id: string
    currentUserId?: string
}

export function ImageViewer({
    src,
    alt = 'Image',
    isActive = false,
    className,
    caption,
    username,
    userAvatar,
    likes = 0,
    comments = 0,
    shares = 0,
    isLiked = false,
    location,
    isShop = false,
    id,
    currentUserId
}: ImageViewerProps) {

    return (
        <div className={cn("relative w-full h-full bg-black overflow-hidden flex items-center justify-center", className)}>

            {/* Background Blur for Ambience */}
            <div className="absolute inset-0 z-0 opacity-50 blur-3xl scale-110">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={src}
                    alt="Background"
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="absolute inset-0 bg-black/30 z-0" />

            {/* Main Image */}
            <div className="relative z-10 w-full h-full max-h-[85vh] flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={src}
                    alt={alt}
                    className="w-full h-full object-contain"
                />
            </div>

            {/* Overlay Content (Simulating Video Feed UI) */}
            <div className="absolute bottom-0 left-0 right-0 p-4 pb-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none z-20">
                <div className="flex flex-col items-end w-full pr-16">
                    <div className="pointer-events-auto text-right w-full">
                        <Link href={`/u/${username}`} className="text-white font-bold text-lg drop-shadow-md mb-1 flex items-center justify-end gap-2 hover:underline">
                            {isShop && <span className="text-[10px] bg-indigo-500 px-1.5 py-0.5 rounded text-white font-normal">متجر</span>}
                            {username}
                        </Link>
                        <p className="text-white/90 text-sm drop-shadow-md leading-relaxed line-clamp-3 ml-auto" dir="rtl">
                            {caption}
                        </p>
                    </div>
                </div>
            </div>

            {/* Actions Side Bar */}
            <div className="absolute right-2 bottom-20 z-30 pointer-events-auto">
                <VideoActions
                    postId={id}
                    likes={likes}
                    comments={comments}
                    shares={shares}
                    location={location}
                    isLiked={isLiked}
                    author={{
                        name: username,
                        avatar: userAvatar,
                        isShop: isShop
                    }}
                    currentUserId={currentUserId}
                />
            </div>
        </div>
    )
}
