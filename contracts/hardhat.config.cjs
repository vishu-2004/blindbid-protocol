// ======================
// CHANGES MADE
// ➕ Added Monad Testnet
// ➕ Env-based private key usage
// ➕ Works with local + public RPCs
// ======================

require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;

module.exports = {
  solidity: "0.8.28",

  networks: {
    // ======================
    // Local Hardhat (in-process)
    // ======================
    hardhat: {
      chainId: 31337,
    },

    // ======================
    // Localhost (npx hardhat node)
    // ======================
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },

    // ======================
    // Monad Testnet
    // ======================
    monadTestnet: {
      url: process.env.MONAD_RPC || "https://testnet-rpc.monad.xyz",
      chainId: 10143,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
};
