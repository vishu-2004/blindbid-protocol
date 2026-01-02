import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

export const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
