import express from "express";
import { verifyVault } from "../controllers/vault.controller.js";

const router = express.Router();

router.post("/verify", verifyVault);

export default router;
