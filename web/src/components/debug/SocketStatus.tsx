"use client"

import { useSocket } from "@/hooks/useSocket"
import { Wifi, WifiOff } from "lucide-react"

export function SocketStatus() {
    const { isConnected } = useSocket()

    return (
        <div className={`fixed bottom-4 left-4 p-2 rounded-full shadow-lg border ${isConnected ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"}`}>
            {isConnected ? (
                <div className="flex items-center gap-2">
                    <Wifi className="w-5 h-5 text-green-500" />
                    <span className="text-xs font-bold text-green-500">متصل</span>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <WifiOff className="w-5 h-5 text-red-500" />
                    <span className="text-xs font-bold text-red-500">غير متصل</span>
                </div>
            )}
        </div>
    )
}
