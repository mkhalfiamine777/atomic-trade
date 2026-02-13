import { createServer } from 'http'
import next from 'next'
import { Server } from 'socket.io'

const dev = process.env.NODE_ENV !== 'production'
const hostname = process.env.HOSTNAME || '0.0.0.0'
const port = parseInt(process.env.PORT || '3000', 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
    const server = createServer((req, res) => {
        handle(req, res)
    })

    // ─── Socket.io Server ───────────────────────────────────
    const io = new Server(server, {
        path: '/api/socket',
        addTrailingSlash: false,
        cors: {
            origin: process.env.NEXT_PUBLIC_APP_URL || '*',
            methods: ['GET', 'POST'],
        },
    })

    io.on('connection', (socket) => {
        console.log(`🟢 Socket connected: ${socket.id}`)

        // ── Join chat room ──────────────────────────────────
        socket.on('join_room', (roomId: string) => {
            socket.join(roomId)
            console.log(`📌 ${socket.id} joined room: ${roomId}`)
        })

        // ── Send message → broadcast to room ────────────────
        socket.on('send_message', (data: { conversationId: string;[key: string]: unknown }) => {
            // Broadcast to everyone in the room EXCEPT sender
            socket.to(data.conversationId).emit('receive_message', data)
        })

        // ── Typing indicator ────────────────────────────────
        socket.on('typing', (data: { conversationId: string; userId: string }) => {
            socket.to(data.conversationId).emit('typing', {
                userId: data.userId,
            })
        })

        // ── Stop typing ─────────────────────────────────────
        socket.on('stop_typing', (data: { conversationId: string; userId: string }) => {
            socket.to(data.conversationId).emit('stop_typing', {
                userId: data.userId,
            })
        })

        // ── Ping/pong for health check ──────────────────────
        socket.on('ping', () => {
            socket.emit('pong', { message: 'Hello from server!' })
        })

        socket.on('disconnect', () => {
            console.log(`🔴 Socket disconnected: ${socket.id}`)
        })
    })

    // ─── Start Server ───────────────────────────────────────
    server.listen(port, hostname, () => {
        console.log(`> Ready on http://${hostname}:${port}`)
        console.log(`> Socket.io ready on http://${hostname}:${port}/api/socket`)
        console.log(`> Environment: ${dev ? 'development' : 'production'}`)
    })
})
