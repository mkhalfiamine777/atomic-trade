
"use client"

import { useSocket } from "@/hooks/useSocket"


export default function SocketStatus() {
    const { socket, isConnected } = useSocket()

    // Optional: Get transport name purely for display, without side effects
    const transport = socket?.io.engine.transport.name || 'N/A'

    return (
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono
            ${isConnected
                ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                : "bg-rose-50 text-rose-600 border-rose-200"
            }`}
        >
            <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
            <span>{isConnected ? "Connected" : "Disconnected"}</span>
            {isConnected && <span className="text-[10px] opacity-70">({transport})</span>}
        </div>
    )
}
