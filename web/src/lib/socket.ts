"use client"

import { io, Socket } from "socket.io-client"

let socket: Socket

export const getSocket = (): Socket => {
    if (!socket) {
        const url = process.env.NEXT_PUBLIC_SOCKET_URL ||
            (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000")

        socket = io(url, {
            path: "/api/socket",
            addTrailingSlash: false,
            transports: ["websocket", "polling"], // Added polling for better firewall compatibility
        })
    }
    return socket
}
