"use client"

import { useEffect, useState } from "react"
import { getSocket } from "@/lib/socket"
import { Socket } from "socket.io-client"

export const useSocket = () => {
    const [socket, setSocket] = useState<Socket | null>(null)
    const [isConnected, setIsConnected] = useState(false)

    useEffect(() => {
        const socketInstance = getSocket()

        function onConnect() {
            setIsConnected(true)
        }

        function onDisconnect() {
            setIsConnected(false)
        }

        socketInstance.on("connect", onConnect)
        socketInstance.on("disconnect", onDisconnect)

        setSocket(socketInstance)

        // Check if already connected
        if (socketInstance.connected) {
            setIsConnected(true)
        }

        return () => {
            socketInstance.off("connect", onConnect)
            socketInstance.off("disconnect", onDisconnect)
        }
    }, [])

    return { socket, isConnected }
}
