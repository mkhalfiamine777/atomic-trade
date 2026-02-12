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
