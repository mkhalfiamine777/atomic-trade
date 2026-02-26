
"use client"

import { useEffect, useRef, useState } from "react"
import { useChat } from "@/hooks/useChat"
import { ArrowLeft, Send } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { RatingModal } from "@/components/modals/RatingModal"
import { Star } from "lucide-react"

interface ChatWindowProps {
    conversationId: string
    currentUserId: string
    otherUser: {
        id: string
        name: string
        avatarUrl: string | null
        username: string
    }
    onBack?: () => void
}

export default function ChatWindow({ conversationId, currentUserId, otherUser, onBack }: ChatWindowProps) {
    const { messages, sendMessage, isLoading, isConnected } = useChat(conversationId, currentUserId)
    const [content, setContent] = useState("")
    const [isRatingOpen, setIsRatingOpen] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    // Auto-scroll to bottom on new message
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages])

    const handleSend = () => {
        if (!content.trim()) return
        sendMessage(content, conversationId, otherUser.id)
        setContent("")
    }

    return (
        <div className="flex flex-col h-full bg-background border-l border-white/5">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-black/20 backdrop-blur-md">
                {onBack && (
                    <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                )}
                <Avatar className="w-10 h-10 border border-primary/20">
                    <AvatarImage src={otherUser.avatarUrl || ""} />
                    <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="font-semibold text-sm">{otherUser.name}</h3>
                    <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                        <span className="text-xs text-muted-foreground">{isConnected ? "Online" : "Connecting..."}</span>
                    </div>
                </div>

                {/* Rating Button */}
                <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto gap-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border-indigo-500/20"
                    onClick={() => setIsRatingOpen(true)}
                >
                    <Star className="w-4 h-4" />
                    <span className="hidden sm:inline">تقييم وإنهاء</span>
                </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {isLoading && messages.length === 0 ? (
                        <div className="text-center text-muted-foreground text-sm py-10">Running conversation...</div>
                    ) : messages.length === 0 ? (
                        <div className="text-center text-muted-foreground text-sm py-10">No messages yet. Say hi! 👋</div>
                    ) : (
                        messages.map((msg, i) => {
                            const isMe = msg.senderId === currentUserId
                            return (
                                <div key={msg.id || i} className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}>
                                    <div className={cn(
                                        "max-w-[75%] px-4 py-2 rounded-2xl text-sm break-words",
                                        isMe
                                            ? "bg-primary text-primary-foreground rounded-br-none"
                                            : "bg-muted text-foreground rounded-bl-none"
                                    )}>
                                        {msg.content}
                                    </div>
                                </div>
                            )
                        })
                    )}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-white/10 bg-black/20 backdrop-blur-md">
                <form
                    className="flex gap-2"
                    onSubmit={(e) => {
                        e.preventDefault()
                        handleSend()
                    }}
                >
                    <Input
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={`Message @${otherUser.username || otherUser.name}...`}
                        className="flex-1 bg-background/50 border-white/10 focus-visible:ring-primary/50"
                    />
                    <Button type="submit" size="icon" disabled={!content.trim()}>
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </div>

            {/* Rating Modal */}
            <RatingModal
                isOpen={isRatingOpen}
                onClose={() => setIsRatingOpen(false)}
                targetUserId={otherUser.id}
                targetUserName={otherUser.name}
                listingId={conversationId} // Using conversationId as context if listing is unknown
                listingTitle={"محادثة مع " + otherUser.name}
            />
        </div>
    )
}
