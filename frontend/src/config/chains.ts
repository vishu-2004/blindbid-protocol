import { defineChain } from 'viem';

// QIE Testnet Chain Definition
export const qieTestnet = defineChain({
  id: 1983,
  name: 'QIE testnet',
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
      url: 'https://testnet.qie.digital/',
    },
  },
  testnet: true,
});

// QIE Mainnet Chain Definition
export const qieMainnet = defineChain({
  id: 1990,
  name: 'QIEMainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'QIE',
    symbol: 'QIEV3',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc1mainnet.qie.digital/'],
    },
  },
  blockExplorers: {
    default: {
      name: 'QIE Explorer',
      url: 'https://mainnet.qie.digital/',
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
  console.log("network in env",import.meta.env.VITE_ACTIVE_NETWORK);
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
