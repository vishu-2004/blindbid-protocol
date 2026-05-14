import { createServer } from "http";
import { Server } from "socket.io";
import app from "./app.js";
import dotenv from "dotenv";
import { initAuctionEvents, handleSocketConnection } from "./services/auction-events.service.js";

dotenv.config();

// Create HTTP server from Express app
const httpServer = createServer(app);

// Attach Socket.IO with CORS config
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Handle socket connections
io.on("connection", handleSocketConnection);

// Initialize contract event listeners + heartbeat
initAuctionEvents(io);

// Start server
httpServer.listen(process.env.PORT, "0.0.0.0", () => {
  console.log("Backend running on port", process.env.PORT);
  console.log("Socket.IO ready for real-time auction sync");
});
