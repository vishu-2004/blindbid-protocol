// ======================
// Auction Events Service
// Listens to VaultAuction contract events and broadcasts
// real-time updates via Socket.IO
// ======================

import { ethers } from "ethers";
import { provider } from "./rpc.service.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const vaultAuctionAbiRaw = fs.readFileSync(path.join(__dirname, "../abi/VaultAuction.json"), "utf8");
const vaultAuctionAbi = JSON.parse(vaultAuctionAbiRaw).abi;

const CONTRACT_ADDRESS = process.env.VAULT_AUCTION_ADDRESS;

let io = null;
let contract = null;
let heartbeatInterval = null;
let blockPollInterval = null;
let lastProcessedBlock = 0;

/**
 * Initialize the auction events service
 * @param {import("socket.io").Server} socketIo - Socket.IO server instance
 */
export function initAuctionEvents(socketIo) {
  io = socketIo;

  if (!CONTRACT_ADDRESS) {
    console.warn("[AuctionEvents] VAULT_AUCTION_ADDRESS not set in .env — event listener disabled");
    startHeartbeat();
    return;
  }

  contract = new ethers.Contract(CONTRACT_ADDRESS, vaultAuctionAbi, provider);

  // -----------------------------------------------------------
  // Manual block polling for contract events.
  // ethers v6 JsonRpcProvider event listeners can be unreliable
  // on Hardhat's on-demand mining. Instead we poll for new blocks
  // and query logs ourselves every 1 second.
  // -----------------------------------------------------------
  startBlockPoller();

  console.log(`[AuctionEvents] Listening for events on contract ${CONTRACT_ADDRESS}`);
  startHeartbeat();
}

/**
 * Poll for new blocks and process any contract events found in them.
 * This is more reliable than ethers v6 contract.on() with Hardhat.
 */
function startBlockPoller() {
  if (blockPollInterval) clearInterval(blockPollInterval);

  // Initialize with current block
  provider.getBlockNumber().then((blockNum) => {
    lastProcessedBlock = blockNum;
    console.log(`[AuctionEvents] Block poller starting from block ${blockNum}`);
  });

  blockPollInterval = setInterval(async () => {
    try {
      const currentBlock = await provider.getBlockNumber();
      if (currentBlock <= lastProcessedBlock) return;

      // Query for all events from lastProcessedBlock+1 to currentBlock
      const fromBlock = lastProcessedBlock + 1;
      const toBlock = currentBlock;

      const events = await contract.queryFilter("*", fromBlock, toBlock);

      for (const event of events) {
        await processEvent(event);
      }

      lastProcessedBlock = currentBlock;
    } catch (err) {
      // Don't spam the console on transient errors
      if (!err.message?.includes("could not coalesce")) {
        console.error("[AuctionEvents] Block poll error:", err.message);
      }
    }
  }, 1000); // Poll every 1 second

  console.log("[AuctionEvents] Block poller started (1s interval)");
}

/**
 * Process a single contract event log and emit via Socket.IO
 */
async function processEvent(event) {
  const eventName = event.fragment?.name;
  if (!eventName) return;

  try {
    switch (eventName) {
      case "BidPlaced": {
        const vaultId = event.args[0];
        const bidder = event.args[1];
        const amount = event.args[2];
        console.log(`[AuctionEvents] BidPlaced on vault ${vaultId} by ${bidder} for ${ethers.formatEther(amount)} ETH`);

        const auctionState = await fetchAuctionState(vaultId);
        const payload = {
          type: "bid:placed",
          vaultId: Number(vaultId),
          bidder,
          amount: amount.toString(),
          ...auctionState,
          serverTime: Date.now(),
        };

        io.to(`auction:${vaultId}`).emit("bid:placed", payload);
        io.emit("auction:update", {
          vaultId: Number(vaultId),
          currentBid: amount.toString(),
          active: auctionState.active,
          ended: auctionState.ended,
        });
        break;
      }

      case "AuctionStarted": {
        const vaultId = event.args[0];
        const startTime = event.args[1];
        const endTime = event.args[2];
        console.log(`[AuctionEvents] AuctionStarted on vault ${vaultId}`);

        const auctionState = await fetchAuctionState(vaultId);
        const payload = {
          type: "auction:started",
          vaultId: Number(vaultId),
          startTime: Number(startTime),
          endTime: Number(endTime),
          ...auctionState,
          serverTime: Date.now(),
        };

        io.to(`auction:${vaultId}`).emit("auction:started", payload);
        io.emit("auction:update", {
          vaultId: Number(vaultId),
          active: true,
          ended: false,
        });
        break;
      }

      case "AuctionEnded": {
        const vaultId = event.args[0];
        const winner = event.args[1];
        const finalPrice = event.args[2];
        console.log(`[AuctionEvents] AuctionEnded on vault ${vaultId}, winner: ${winner}`);

        const payload = {
          type: "auction:ended",
          vaultId: Number(vaultId),
          winner,
          finalPrice: finalPrice.toString(),
          active: false,
          ended: true,
          serverTime: Date.now(),
        };

        io.to(`auction:${vaultId}`).emit("auction:ended", payload);
        io.emit("auction:update", {
          vaultId: Number(vaultId),
          active: false,
          ended: true,
        });
        break;
      }

      case "AuctionCancelled": {
        const vaultId = event.args[0];
        console.log(`[AuctionEvents] AuctionCancelled on vault ${vaultId}`);

        const payload = {
          type: "auction:cancelled",
          vaultId: Number(vaultId),
          serverTime: Date.now(),
        };

        io.to(`auction:${vaultId}`).emit("auction:cancelled", payload);
        io.emit("auction:update", {
          vaultId: Number(vaultId),
          active: false,
          ended: false,
        });
        break;
      }

      case "AuctionCreated": {
        const vaultId = event.args[0];
        console.log(`[AuctionEvents] AuctionCreated on vault ${vaultId}`);
        io.emit("auction:update", {
          vaultId: Number(vaultId),
          active: false,
          ended: false,
        });
        break;
      }

      default:
        // Ignore other events (VaultCreated, VaultCancelled, etc.)
        break;
    }
  } catch (err) {
    console.error(`[AuctionEvents] Error processing ${eventName}:`, err);
  }
}

/**
 * Fetch the current auction state from the contract
 */
async function fetchAuctionState(vaultId) {
  try {
    const timing = await contract.getAuctionTiming(vaultId);
    const auction = await contract.getAuction(vaultId);

    return {
      currentBid: auction.currentBid.toString(),
      highestBidder: auction.highestBidder,
      lastBidTime: Number(timing.lastBidTime),
      bidWindow: Number(timing.bidWindow),
      endTime: Number(timing.endTime),
      active: timing.active,
      ended: timing.ended,
      startPrice: auction.startPrice.toString(),
    };
  } catch (err) {
    console.error("[AuctionEvents] Failed to fetch auction state:", err);
    return {};
  }
}

/**
 * Fetch auction state via REST (for initial page load)
 */
export async function getAuctionStateREST(vaultId) {
  if (!contract) {
    throw new Error("Contract not initialized");
  }

  const timing = await contract.getAuctionTiming(vaultId);
  const auction = await contract.getAuction(vaultId);

  return {
    vaultId: Number(vaultId),
    seller: auction.seller,
    currentBid: auction.currentBid.toString(),
    highestBidder: auction.highestBidder,
    startTime: Number(auction.startTime),
    lastBidTime: Number(timing.lastBidTime),
    bidWindow: Number(timing.bidWindow),
    auctionDuration: Number(auction.auctionDuration),
    endTime: Number(timing.endTime),
    active: timing.active,
    ended: timing.ended,
    startPrice: auction.startPrice.toString(),
    serverTime: Date.now(),
  };
}

/**
 * Start the heartbeat interval — broadcasts server time every second
 * so all clients stay synchronized
 */
function startHeartbeat() {
  if (heartbeatInterval) clearInterval(heartbeatInterval);

  heartbeatInterval = setInterval(() => {
    if (io) {
      io.emit("time:sync", { serverTime: Date.now() });
    }
  }, 1000);

  console.log("[AuctionEvents] Heartbeat started (1s interval)");
}

/**
 * Handle Socket.IO connection events
 */
export function handleSocketConnection(socket) {
  console.log(`[Socket] Client connected: ${socket.id}`);

  // Client joins an auction room
  socket.on("join:auction", (vaultId) => {
    const room = `auction:${vaultId}`;
    socket.join(room);
    console.log(`[Socket] ${socket.id} joined ${room}`);

    // Send immediate time sync on join
    socket.emit("time:sync", { serverTime: Date.now() });
  });

  // Client leaves an auction room
  socket.on("leave:auction", (vaultId) => {
    const room = `auction:${vaultId}`;
    socket.leave(room);
    console.log(`[Socket] ${socket.id} left ${room}`);
  });

  socket.on("disconnect", () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
}
