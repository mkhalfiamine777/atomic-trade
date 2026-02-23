import { Server } from 'socket.io'

// ─── Global Socket.IO Bridge ──────────────────────────────
// Allows Server Actions to access the Socket.IO instance
// created in server.ts via a global singleton pattern.

let ioInstance: Server | null = null

export const setIO = (io: Server) => {
    ioInstance = io
    console.log('[SocketEngine] ✅ IO instance registered globally')
}

export const getIO = (): Server | null => ioInstance
