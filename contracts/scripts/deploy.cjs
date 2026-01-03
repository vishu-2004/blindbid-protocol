// ======================
// CHANGES MADE
// ➕ Network-aware deployment (local / qieTestnet / qieMainnet)
// ➕ ChainId validation for safety
// ➕ Single script for all networks
// ======================

const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const { ethers, network } = hre;

  console.log("🚀 Deploying on network:", network.name);
  console.log("🔗 Chain ID:", network.config.chainId);

  // ✅ Safety check (optional but recommended)
  const allowedChainIds = [31337, 1983, 1990];
  if (!allowedChainIds.includes(network.config.chainId)) {
    throw new Error("❌ Unsupported network");
  }

  // ======================
  // Deploy VaultAuction
  // ======================
  const VaultAuction = await ethers.getContractFactory("VaultAuction");
  const auction = await VaultAuction.deploy();
  await auction.waitForDeployment();

  // ======================
  // Deploy MonkeyNFT
  // ======================
  const MonkeyNFT = await ethers.getContractFactory("MonkeyNFT");
  const nft = await MonkeyNFT.deploy();
  await nft.waitForDeployment();

  // ======================
  // Logs
  // ======================
  console.log("✅ VaultAuction deployed at:");
  console.log(await auction.getAddress());

  console.log("✅ MonkeyNFT deployed at:");
  console.log(await nft.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
