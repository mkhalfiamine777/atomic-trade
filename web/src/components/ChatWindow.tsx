'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { sendMessage, getConversationMessages } from '@/actions/chat'
import { toast } from 'sonner'

interface Message {
    id: string
    content: string
    senderId: string
    sender: { name: string | null }
    createdAt: Date
}

interface Props {
    conversationId: string
    onClose: () => void
    currentUserId: string
    recipientName: string
}

export function ChatWindow({ conversationId, onClose, currentUserId, recipientName }: Props) {
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    // Poll for messages every 2 seconds
    useEffect(() => {
        const fetchMessages = async () => {
            const data = await getConversationMessages(conversationId)
            // @ts-ignore
            setMessages(data)
        }

        fetchMessages()
        const interval = setInterval(fetchMessages, 2000)
        return () => clearInterval(interval)
    }, [conversationId])

    // Auto scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    async function handleSend(e: React.FormEvent) {
        e.preventDefault()
        if (!newMessage.trim()) return

        setLoading(true)
        await sendMessage(conversationId, newMessage)
        setNewMessage('')
        setLoading(false)

        // Immediate refresh
        const data = await getConversationMessages(conversationId)
        // @ts-ignore
        setMessages(data)
    }

    return (
        <div className="fixed bottom-4 right-4 z-[9999] w-80 md:w-96 bg-zinc-900 border border-zinc-700 rounded-t-xl shadow-2xl flex flex-col overflow-hidden h-[500px]">
            {/* Header */}
            <div className="bg-zinc-800 p-3 flex justify-between items-center border-b border-zinc-700">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="font-bold text-white text-sm">{recipientName}</span>
                </div>
                <button onClick={onClose} className="text-zinc-400 hover:text-white">
                    ✕
                </button>
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-950/50">
                {messages.length === 0 && (
                    <p className="text-center text-zinc-500 text-xs mt-10">
                        ابدأ المحادثة بأمان 🔒
                        <br />
                        لا تشارك رقم هاتفك إلا إذا وثقت بالطرف الآخر.
                    </p>
                )}

                {messages.map(msg => {
                    const isMe = msg.senderId === currentUserId
                    return (
                        <div
                            key={msg.id}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[75%] rounded-lg p-2 text-sm ${isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-zinc-800 text-zinc-200 rounded-bl-none'}`}
                            >
                                <p>{msg.content}</p>
                                <span className="text-[10px] opacity-50 block text-right mt-1">
                                    {new Date(msg.createdAt).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Input Area */}
            <form
                onSubmit={handleSend}
                className="p-3 bg-zinc-800 border-t border-zinc-700 flex gap-2"
            >
                <input
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="اكتب رسالتك..."
                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded-full px-4 h-10 text-sm focus:outline-none focus:border-indigo-500 text-right"
                />
                <button
                    disabled={loading || !newMessage.trim()}
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors disabled:opacity-50"
                >
                    ➤
                </button>
            </form>
        </div>
    )
}
