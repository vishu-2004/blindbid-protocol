// ======================
// CHANGES MADE
// ➕ Added QIE Testnet & Mainnet
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
    // Local Hardhat
    // ======================
    hardhat: {
      chainId: 31337,
    },

    // ======================
    // QIE Testnet
    // ======================
    qieTestnet: {
      url: "https://rpc1testnet.qie.digital/",
      chainId: 1983,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },

    // ======================
    // QIE Mainnet
    // ======================
    qieMainnet: {
      url: "https://rpc1mainnet.qie.digital/",
      chainId: 1990,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
};
