
"use client"

import { useSocket } from "@/hooks/useSocket"
import { useEffect, useState } from "react"

export default function SocketStatus() {
    const { socket, isConnected } = useSocket()
    const [transport, setTransport] = useState<string>("N/A")
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!socket) return

        function onConnect() {
            setTransport(socket!.io.engine.transport.name)
            setError(null)
            console.log("🟢 Connected to Socket.IO server")

            socket!.io.engine.on("upgrade", (transport) => {
                setTransport(transport.name)
            })
        }

        function onDisconnect() {
            setTransport("N/A")
        }

        function onError(err: Error) {
            console.error("Socket error:", err)
            setError(err.message)
        }

        if (socket.connected) {
            onConnect()
        }

        socket.on("connect", onConnect)
        socket.on("disconnect", onDisconnect)
        socket.on("connect_error", onError)

        return () => {
            socket.off("connect", onConnect)
            socket.off("disconnect", onDisconnect)
            socket.off("connect_error", onError)
        }
    }, [socket])

    return (
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono
            ${isConnected
                ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                : "bg-rose-50 text-rose-600 border-rose-200"
            }`}
        >
            <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
            <span>{isConnected ? "Connected" : error ? `Error: ${error}` : "Disconnected"}</span>
            {isConnected && <span className="text-[10px] opacity-70">({transport})</span>}
        </div>
    )
}
