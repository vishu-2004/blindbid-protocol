import express from "express";
import cors from "cors";
import vaultRoutes from "./routes/vault.routes.js";
import auctionRoutes from "./routes/auction.routes.js";


const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/vault", vaultRoutes);
app.use("/api/auction", auctionRoutes);

export default app;
