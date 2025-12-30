// ======================
// CHANGES MADE
// ➕ Env-based deploy
// ➕ Works for local + monad
// ======================

const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const network = process.env.DEPLOY_NETWORK;
  console.log("🚀 Deploying to:", network);

  const VaultAuction = await hre.ethers.getContractFactory("VaultAuction");
  const auction = await VaultAuction.deploy();

  await auction.waitForDeployment();

  console.log("✅ VaultAuction deployed to:");
  console.log(await auction.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
