import React, { useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'

interface InfiniteScrollSentinelProps {
    onIntersect: () => void
    hasMore: boolean
    isLoading: boolean
}

export function InfiniteScrollSentinel({ onIntersect, hasMore, isLoading }: InfiniteScrollSentinelProps) {
    const observerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!hasMore || isLoading) return

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    onIntersect()
                }
            },
            { threshold: 0.1, rootMargin: '10px' }
        )

        if (observerRef.current) {
            observer.observe(observerRef.current)
        }

        return () => observer.disconnect()
    }, [hasMore, isLoading, onIntersect])

    if (!hasMore) return null

    return (
        <div ref={observerRef} className="flex justify-center p-6 h-20 w-full">
            {isLoading && (
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            )}
        </div>
    )
}
