
import { useEffect, useState, useRef } from "react";
import { useSocket } from "@/hooks/useSocket";
import { toast } from "sonner"; // Assuming sonner is used for notifications

import { Message } from "@/types";

export const useChat = (initialConversationId: string | null, userId: string | null) => {
    const { socket, isConnected } = useSocket();
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Track the active room ID. Starts as initial (maybe temporary 'conv-'), 
    // but upgrades to real DB UUID after first message.
    const [activeRoomId, setActiveRoomId] = useState<string | null>(initialConversationId);

    // Ref for optimistic updates to avoid dependency cycles / stale closures
    const messagesRef = useRef<Message[]>([]);

    // Sync if initial ID changes from parent
    useEffect(() => {
        setActiveRoomId(initialConversationId);
    }, [initialConversationId]);

    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    // 1. Fetch initial messages when conversation opens
    useEffect(() => {
        if (!initialConversationId) return;

        const fetchMessages = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/messages?conversationId=${initialConversationId}`);
                if (!res.ok) throw new Error("Failed to load messages");
                const data = await res.json();

                // If it was a real existing DB ID, data will have elements and activeRoomId is correct.
                // If data is empty and we sent a temp ID, we just start fresh.
                setMessages(data);

                // If we get messages back and notice they belong to a real conversation ID, 
                // we should upgrade our active room to it immediately if we were using a temp one.
                if (data.length > 0 && initialConversationId?.startsWith("conv-")) {
                    setActiveRoomId(data[0].conversationId);
                }
            } catch (error) {
                console.error(error);
                toast.error("Error loading chat history");
            } finally {
                setIsLoading(false);
            }
        };

        fetchMessages();
    }, [initialConversationId, userId]);

    // 2. Handle Socket Events - Bind to Active Room ID
    useEffect(() => {
        if (!socket || !activeRoomId) return;

        // Join the active conversation room
        socket.emit("join_room", activeRoomId);

        const handleReceiveMessage = (newMessage: Message) => {
            // Only add if it belongs to this conversation (double check)
            // and prevent duplicates if we optimistic updated
            setMessages((prev) => {
                const exists = prev.some(m => m.id === newMessage.id || (m.createdAt === newMessage.createdAt && m.senderId === newMessage.senderId));
                if (exists) return prev;
                return [...prev, newMessage];
            });
        };

        const handleTyping = () => {
            // Simple implementation: show "Someone is typing..."
            // In real app, you'd pass user data
        };

        socket.on("receive_message", handleReceiveMessage);
        socket.on("typing", handleTyping);

        return () => {
            socket.off("receive_message", handleReceiveMessage);
            socket.off("typing", handleTyping);
            // Leave room when changing rooms
            socket.emit("leave_room", activeRoomId);
        };
    }, [socket, activeRoomId]);

    const sendMessage = async (content: string, _ignoredParam: string, receiverId: string) => {
        if (!content.trim() || !userId) return;

        const tempId = Date.now().toString();
        const newMessage: Message = {
            id: tempId,
            content,
            senderId: userId,
            createdAt: new Date().toISOString(),
            sender: {
                id: userId,
                name: "Me",
                avatarUrl: null
            }
        };

        setMessages((prev) => [...prev, newMessage]);

        try {
            const res = await fetch("/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    conversationId: activeRoomId, // Use active, it might be null or real now
                    senderId: userId,
                    receiverId,
                    content
                })
            });

            if (!res.ok) throw new Error("Failed to send");

            const savedMessage = await res.json();

            // Upgrade Room ID if we just created it on the server
            if (activeRoomId?.startsWith("conv-")) {
                setActiveRoomId(savedMessage.conversationId); // Now we join the REAL UUID room
            }

            setMessages((prev) =>
                prev.map(m => m.id === tempId ? savedMessage : m)
            );

            // EMIT with the REAL database UUID we just got from the API
            socket?.emit("send_message", {
                ...savedMessage,
                conversationId: savedMessage.conversationId
            });
        } catch (error) {
            console.error(error);
            toast.error("Message failed to send");
            setMessages((prev) => prev.filter(m => m.id !== tempId));
        }
    };

    return {
        messages,
        sendMessage,
        isLoading,
        isConnected
    };
};
