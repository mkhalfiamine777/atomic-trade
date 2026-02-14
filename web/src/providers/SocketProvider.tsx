'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { Socket } from 'socket.io-client'
import { getSocket } from '@/lib/socket'

interface SocketContextType {
    socket: Socket | null
    isConnected: boolean
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false
})

export const useSocketContext = () => useContext(SocketContext)

export function SocketProvider({ children }: { children: React.ReactNode }) {
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

        socketInstance.on('connect', onConnect)
        socketInstance.on('disconnect', onDisconnect)

        setSocket(socketInstance)

        // Initial check
        if (socketInstance.connected) {
            onConnect()
        }

        return () => {
            socketInstance.off('connect', onConnect)
            socketInstance.off('disconnect', onDisconnect)
        }
    }, [])

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    )
}
