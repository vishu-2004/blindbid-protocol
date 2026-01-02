import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const getRpcUrl = () => {
    const network = process.env.NETWORK?.trim();
    if (!network) {
        throw new Error("NETWORK environment variable is required");
    }
  switch (network) {
    case "local":
      return process.env.LOCAL_RPC_URL;
    case "testnet":
      return process.env.TESTNET_RPC_URL;
    case "mainnet":
      return process.env.MAINNET_RPC_URL;
    default:
      throw new Error(`Unknown network: ${network}`);
  }
};

export const provider = new ethers.JsonRpcProvider(getRpcUrl());
