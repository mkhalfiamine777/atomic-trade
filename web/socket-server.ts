import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    },
    // Ensure the path matches the client configuration
    path: "/api/socket",
    addTrailingSlash: false,
});

io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join_room", (room) => {
        socket.join(room);
    });

    socket.on("send_message", (data) => {
        // data: { conversationId, content, senderId, senderName, senderAvatar }

        // Broadcast to everyone in the room EXCEPT the sender
        // Verify proper room targeting
        socket.to(data.conversationId).emit("receive_message", data);
    });

    socket.on("typing", (room) => {
        socket.to(room).emit("typing");
    });

    socket.on("stop_typing", (room) => {
        socket.to(room).emit("stop_typing");
    });

    socket.on("ping", () => {
        socket.emit("pong", { message: "Hello from standalone socket server!" });
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});

const PORT = 3001; // Using a different port than Next.js (3000)

httpServer.listen(PORT, () => {
    console.log(`> Socket.io server ready on http://localhost:${PORT}`);
});
