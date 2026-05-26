import { createServer } from "http";
import { Server } from "socket.io";
import app from "./app.js";
import dotenv from "dotenv";
import { initAuctionEvents, handleSocketConnection } from "./services/auction-events.service.js";

dotenv.config();

const PORT = process.env.PORT || 10000;

// Health check endpoint for Render
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: Date.now() });
});
// Create HTTP server from Express app
const httpServer = createServer(app);

// Attach Socket.IO with CORS config
const ALLOWED_ORIGINS = [
  "https://blindbid-protocol.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

const io = new Server(httpServer, {
  cors: {
    origin: ALLOWED_ORIGINS.length > 0 ? ALLOWED_ORIGINS : "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Handle socket connections
io.on("connection", handleSocketConnection);

// Initialize contract event listeners + heartbeat
initAuctionEvents(io);

// Start server
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running on port ${PORT}`);
  console.log("Socket.IO ready for real-time auction sync");
});
