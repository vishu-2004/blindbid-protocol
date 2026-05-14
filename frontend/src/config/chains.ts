import { defineChain } from 'viem';

// Monad Testnet Chain Definition
export const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MON',
    symbol: 'MON',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.monad.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Monad Explorer',
      url: 'https://testnet.monadvision.com',
    },
  },
  testnet: true,
});

// Local Hardhat Chain Definition
export const hardhatLocal = defineChain({
  id: 31337,
  name: 'Hardhat Local',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545'],
    },
  },
  testnet: true,
});

// Get active chain based on environment
export const getActiveNetwork = () => {
  console.log("network in env",import.meta.env.VITE_ACTIVE_NETWORK);
  const network = import.meta.env.VITE_ACTIVE_NETWORK || 'testnet';
  
  switch (network) {
    case 'local':
      return hardhatLocal;
    case 'testnet':
    default:
      return monadTestnet;
  }
};

// All supported chains
export const supportedChains = [monadTestnet, hardhatLocal] as const;
