"use client"

import { io, Socket } from "socket.io-client"

let socket: Socket

export const getSocket = (): Socket => {
    if (!socket) {
        socket = io({
            path: "/api/socket",
            addTrailingSlash: false,
        })
    }
    return socket
}
