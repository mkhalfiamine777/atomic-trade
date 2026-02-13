"use client"

import { io, Socket } from "socket.io-client"

let socket: Socket

export const getSocket = (): Socket => {
    if (!socket) {
        socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001", {
            path: "/api/socket",
            addTrailingSlash: false,
            transports: ["websocket"],
        })
    }
    return socket
}
