'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, User as UserIcon } from 'lucide-react'
import { getComments } from '@/actions/interactions'
import { toast } from 'sonner'

interface Comment {
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

interface Props {
    listingId: string | null
    onClose: () => void
    currentUserId?: string
}

export function CommentsSheet({ listingId, onClose, currentUserId }: Props) {
    const [comments, setComments] = useState<Comment[]>([])
    const [newComment, setNewComment] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isSending, setIsSending] = useState(false)

    useEffect(() => {
        if (listingId) {
            fetchComments()
        }
    }, [listingId])

    const fetchComments = async () => {
        if (!listingId) return
        setIsLoading(true)
        const data = await getComments(listingId)
        // Adjust type if needed, assuming the action returns compatible structure
        setComments(data as any)
        setIsLoading(false)
    }

    const handleSend = async () => {
        if (!newComment.trim() || !listingId || !currentUserId) return

        setIsSending(true)
        // We import 'addComment' as 'AddComment' to avoid naming conflicts if any, 
        // but wait, I exported it as 'addComment'. Let me fix import.
        const { addComment } = await import('@/actions/interactions')

        const result = await addComment(listingId, newComment)

        if (result.success) {
            setNewComment('')
            fetchComments() // Refresh list
            toast.success('تم نشر تعليقك! 💬')
        } else {
            toast.error('فشل نشر التعليق')
        }
        setIsSending(false)
    }

    if (!listingId) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    className="bg-zinc-900 w-full max-w-lg h-[80vh] sm:h-[600px] rounded-t-2xl sm:rounded-2xl border border-zinc-800 flex flex-col shadow-2xl overflow-hidden"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            💬 التعليقات <span className="text-zinc-500 text-sm">({comments.length})</span>
                        </h3>
                        <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Comments List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-2">
                                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                <span className="text-sm">جاري تحميل التعليقات...</span>
                            </div>
                        ) : comments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-zinc-500 opacity-60">
                                <MessageCircleIcon className="w-12 h-12 mb-2 stroke-1" />
                                <p>لا توجد تعليقات بعد. كن أول من يعلق! 👇</p>
                            </div>
                        ) : (
                            comments.map(comment => (
                                <div key={comment.id} className="flex gap-3 text-right group">
                                    <div className="shrink-0 pt-1">
                                        {comment.user.avatarUrl ? (
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
                            ))
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-zinc-800 bg-zinc-900/80 backdrop-blur pb-8 sm:pb-4">
                        <div className="relative flex items-center gap-2">
                            {currentUserId ? (
                                <>
                                    <input
                                        type="text"
                                        value={newComment}
                                        onChange={e => setNewComment(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                                        placeholder="اكتب تعليقاً..."
                                        className="flex-1 bg-zinc-800 text-white placeholder-zinc-500 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 border border-zinc-700 transition-all text-right"
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={!newComment.trim() || isSending}
                                        className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white p-3 rounded-full transition-transform active:scale-95 shadow-lg shadow-indigo-500/20"
                                    >
                                        {isSending ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <Send className="w-5 h-5 rtl:rotate-180" />
                                        )}
                                    </button>
                                </>
                            ) : (
                                <div className="w-full text-center text-sm text-zinc-500 py-2 bg-zinc-800/30 rounded-lg border border-dashed border-zinc-700">
                                    🔒 سجل الدخول للمشاركة في النقاش
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

function MessageCircleIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
        </svg>
    )
}
