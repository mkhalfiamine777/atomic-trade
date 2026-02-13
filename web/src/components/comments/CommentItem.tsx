import React from 'react'
import { User as UserIcon } from 'lucide-react'

export interface Comment {
    id: string
    content: string
    createdAt: Date
    user: {
        id: string
        name: string | null
        avatarUrl: string | null
        isVerified: boolean
    }
}

interface CommentItemProps {
    comment: Comment
}

export function CommentItem({ comment }: CommentItemProps) {
    return (
        <div className="flex gap-3 text-right group">
            <div className="shrink-0 pt-1">
                {comment.user.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={comment.user.avatarUrl} className="w-8 h-8 rounded-full object-cover border border-zinc-700" alt={comment.user.name || 'User'} />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                        <UserIcon className="w-4 h-4 text-zinc-400" />
                    </div>
                )}
            </div>
            <div className="flex-1 bg-zinc-800/50 p-3 rounded-2xl rounded-tr-none border border-zinc-800/50 hover:border-zinc-700 transition-colors">
                <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm text-zinc-200">
                        {comment.user.name || 'مستخدم مجهول'}
                        {comment.user.isVerified && <span className="mr-1 text-blue-400 text-[10px]">✓</span>}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed">
                    {comment.content}
                </p>
            </div>
        </div>
    )
}
