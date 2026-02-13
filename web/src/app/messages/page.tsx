
"use client"

import { useEffect, useState } from "react"
import ChatWindow from "@/components/chat/ChatWindow"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { getCurrentUser } from "@/actions/getCurrentUser"
import { UserProfile } from "@/types"

export default function MessagesPage() {
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function loadUser() {
            try {
                const user = await getCurrentUser()
                setCurrentUser(user)
            } catch (error) {
                console.error("Failed to load user", error)
            } finally {
                setIsLoading(false)
            }
        }
        loadUser()
    }, [])

    if (isLoading) {
        return <div className="flex h-[calc(100vh-6rem)] items-center justify-center m-4 text-muted-foreground">جاري التحميل...</div>
    }

    if (!currentUser) {
        return <div className="flex h-[calc(100vh-6rem)] items-center justify-center m-4 text-muted-foreground">يجب تسجيل الدخول للوصول إلى الرسائل</div>
    }

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)] m-4 gap-2">
            <div className="flex flex-1 border rounded-xl overflow-hidden bg-background/50 backdrop-blur border-white/10">
                {/* Sidebar List (Placeholder for now as we don't have a messy contacts list anymore) */}
                <div className={cn("w-full md:w-80 border-r border-white/10 flex flex-col", selectedConversation ? "hidden md:flex" : "flex")}>
                    <div className="p-4 border-b border-white/10 font-bold bg-white/5">الرسائل</div>
                    <ScrollArea className="flex-1">
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            لا توجد محادثات نشطة حالياً.
                            <br />
                            يمكنك بدء محادثة من ملف المستخدم أو الخريطة.
                        </div>
                    </ScrollArea>
                </div>

                {/* Chat Area */}
                <div className={cn("flex-1 flex flex-col bg-background/30", !selectedConversation ? "hidden md:flex" : "flex")}>
                    {selectedConversation ? (
                        // This part will need the Conversation ID passed from the sidebar or URL parameters in the future
                        <div className="flex-1 flex items-center justify-center text-muted-foreground">
                            محادثة مختارة (سيتم تنفيذ قائمة المحادثات لاحقاً)
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-muted-foreground">
                            اختر محادثة للبدء في الدردشة
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
