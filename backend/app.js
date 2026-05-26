import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import vaultRoutes from "./routes/vault.routes.js";
import auctionRoutes from "./routes/auction.routes.js";

dotenv.config();

const allowedOrigins = [
  "https://blindbid-protocol.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

const app = express();
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

app.use("/api/vault", vaultRoutes);
app.use("/api/auction", auctionRoutes);

export default app;
