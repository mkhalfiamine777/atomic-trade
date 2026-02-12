
"use client"

import { useEffect, useState } from "react"
import { useSocket } from "@/hooks/useSocket"

export default function ChatTestPage() {
    const { socket, isConnected } = useSocket()
    const [messages, setMessages] = useState<string[]>([])
    const [input, setInput] = useState("")

    useEffect(() => {
        if (!socket) return

        socket.on("pong", (data: { message: string }) => {
            setMessages(prev => [...prev, `Server: ${data.message}`])
        })

        return () => {
            socket.off("pong")
        }
    }, [socket])

    const sendPing = () => {
        if (socket) {
            socket.emit("ping")
            setMessages(prev => [...prev, "Me: Ping!"])
        }
    }

    return (
        <div className="p-10 max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-4">Socket.IO Test</h1>

            <div className={`mb-4 p-2 rounded ${isConnected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                Status: {isConnected ? "Connected 🟢" : "Disconnected 🔴"}
            </div>

            <div className="border p-4 h-64 overflow-y-auto mb-4 bg-gray-50 rounded">
                {messages.map((msg, i) => (
                    <div key={i} className="mb-1 border-b py-1">{msg}</div>
                ))}
            </div>

            <button
                onClick={sendPing}
                disabled={!isConnected}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
                Send Ping
            </button>
        </div>
    )
}
