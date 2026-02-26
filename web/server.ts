import { createServer } from 'http'
import next from 'next'
import { Server } from 'socket.io'
import { setIO } from './src/lib/socketEngine'
import { db } from './src/lib/db'

const dev = process.env.NODE_ENV !== 'production'
const hostname = '0.0.0.0' // Force binding to 0.0.0.0 for Railway
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

    // Register IO globally for Server Actions access
    setIO(io)

    io.on('connection', (socket) => {
        console.log(`🟢 Socket connected: ${socket.id}`)

        // ── Auth Check (Simple cookie extraction) ────────────────
        const cookiesAttr = socket.handshake.headers.cookie;
        const userId = cookiesAttr?.split(';').find(c => c.trim().startsWith('user_id='))?.split('=')[1];

        // ── Auto-join user's personal notification room ─────
        if (userId) {
            socket.join(`user:${userId}`)
            console.log(`🔔 ${socket.id} joined notification room: user:${userId}`)
        }

        // ── Join chat room ──────────────────────────────────
        socket.on('join_room', async (roomId: string) => {
            // Security: Only allow if it's a valid roomId and user is authenticated
            if (!userId) {
                console.warn(`⚠️ Unauthenticated socket ${socket.id} tried to join room ${roomId}`);
                return;
            }

            // If it's a real Conversation UUID (not a temporary ID from the UI)
            if (!roomId.startsWith('conv-')) {
                try {
                    const conversation = await db.conversation.findUnique({
                        where: { id: roomId },
                        select: { participant1Id: true, participant2Id: true }
                    });

                    // If conversation doesn't exist or user is NOT a participant
                    if (!conversation || (conversation.participant1Id !== userId && conversation.participant2Id !== userId)) {
                        console.warn(`🚨 Security Alert: Unauthorized attempt to join room ${roomId} by user ${userId} (Socket: ${socket.id})`);
                        return; // Block joining
                    }
                } catch (error) {
                    console.error(`[SOCKET_DB_ERROR] Failed to verify room access for ${roomId}:`, error);
                    return; // Fail secure
                }
            }

            socket.join(roomId)
            console.log(`📌 ${socket.id} (User: ${userId}) joined room: ${roomId}`)
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
