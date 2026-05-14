import express from "express";
import { getAuctionState } from "../controllers/auction.controller.js";

const router = express.Router();

// GET /api/auction/:id/state — returns current auction state + server time
router.get("/:id/state", getAuctionState);

export default router;
