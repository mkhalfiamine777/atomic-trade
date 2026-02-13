
import { useEffect, useState, useRef } from "react";
import { useSocket } from "@/hooks/useSocket";
import { toast } from "sonner"; // Assuming sonner is used for notifications

import { Message } from "@/types";

export const useChat = (conversationId: string | null, userId: string | null) => {
    const { socket, isConnected } = useSocket();
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Ref for optimistic updates to avoid dependency cycles / stale closures
    const messagesRef = useRef<Message[]>([]);

    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    // 1. Fetch initial messages when conversation opens
    useEffect(() => {
        if (!conversationId) return;

        const fetchMessages = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/messages?conversationId=${conversationId}&userId=${userId}`);
                if (!res.ok) throw new Error("Failed to load messages");
                const data = await res.json();
                setMessages(data);
            } catch (error) {
                console.error(error);
                toast.error("Error loading chat history");
            } finally {
                setIsLoading(false);
            }
        };

        fetchMessages();
    }, [conversationId, userId]);

    // 2. Handle Socket Events
    useEffect(() => {
        if (!socket || !conversationId) return;

        // Join the conversation room
        socket.emit("join_room", conversationId);

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
            // Optional: leave room
        };
    }, [socket, conversationId]);

    const sendMessage = async (content: string, conversationId: string, receiverId: string) => {
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
                    conversationId,
                    senderId: userId,
                    receiverId,
                    content
                })
            });

            if (!res.ok) throw new Error("Failed to send");

            const savedMessage = await res.json();

            setMessages((prev) =>
                prev.map(m => m.id === tempId ? savedMessage : m)
            );

            // EMIT with the LOCAL conversationId (the room we joined), 
            // otherwise the other user won't receive it because they are listening on the 'conv-' ID, 
            // not the new database UUID.
            socket?.emit("send_message", {
                ...savedMessage,
                conversationId: conversationId
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
