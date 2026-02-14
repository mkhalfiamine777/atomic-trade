"use client"

import { useSocketContext } from "@/providers/SocketProvider"

export const useSocket = () => {
    return useSocketContext()
}
