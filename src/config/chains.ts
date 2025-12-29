import { defineChain } from 'viem';

// QIE Testnet Chain Definition
export const qieTestnet = defineChain({
  id: 8227,
  name: 'QIE Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'QIE',
    symbol: 'QIE',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc1testnet.qie.digital/'],
    },
  },
  blockExplorers: {
    default: {
      name: 'QIE Testnet Explorer',
      url: 'https://testnet.qiescan.io',
    },
  },
  testnet: true,
});

// QIE Mainnet Chain Definition
export const qieMainnet = defineChain({
  id: 8228,
  name: 'QIE Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'QIE',
    symbol: 'QIE',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc1mainnet.qie.digital/'],
    },
  },
  blockExplorers: {
    default: {
      name: 'QIE Explorer',
      url: 'https://qiescan.io',
    },
  },
  testnet: false,
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
  const network = import.meta.env.VITE_ACTIVE_NETWORK || 'testnet';
  
  switch (network) {
    case 'local':
      return hardhatLocal;
    case 'mainnet':
      return qieMainnet;
    case 'testnet':
    default:
      return qieTestnet;
  }
};

// All supported chains
export const supportedChains = [qieTestnet, qieMainnet, hardhatLocal] as const;
