import React from 'react'
import { Play } from 'lucide-react'
import { TabStory, TabPost } from '@/types'
import { EmptyState } from './EmptyState'

interface MediaGridProps {
    stories: TabStory[]
    posts: TabPost[]
    onPostClick: (post: TabPost) => void
}

export function MediaGrid({ stories, posts, onPostClick }: MediaGridProps) {
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

    const items: (TabPost & { _type: 'STORY' | 'POST' })[] = [...storyItems, ...postItems]

    if (items.length === 0) return <EmptyState label="لا توجد صور أو فيديوهات" />

    return (
        <div className="grid grid-cols-3 gap-0.5">
            {items.map(item => (
                <div
                    key={item.id}
                    onClick={() => onPostClick(item)}
                    className="aspect-square relative bg-zinc-900 overflow-hidden cursor-pointer group"
                >
                    {item.mediaType === 'VIDEO' || item.mediaUrl.endsWith('.mp4') ? (
                        <video
                            src={item.mediaUrl + '#t=0.1'}
                            className="w-full h-full object-cover pointer-events-none"
                            preload="metadata"
                            muted
                            playsInline
                        />
                    ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={item.mediaUrl}
                            alt={item.caption || ''}
                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                            loading="lazy"
                        />
                    )}
                    <div className="absolute top-1 right-1 pointer-events-none">
                        {item._type === 'STORY' && <div className="bg-purple-600/80 rounded-full p-1"><Play className="w-3 h-3 text-white fill-white" /></div>}
                        {item.mediaType === 'VIDEO' && item._type === 'POST' && <div className="bg-black/50 rounded-full p-1"><Play className="w-3 h-3 text-white fill-white" /></div>}
                    </div>
                </div>
            ))}
        </div>
    )
}
