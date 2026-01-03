import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { getActiveNetwork } from './chains';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id';

// Get the single active chain based on environment
const activeChain = getActiveNetwork();

export const config = getDefaultConfig({
  appName: 'BlindBid',
  projectId,
  chains: [activeChain],
  transports: {
    [activeChain.id]: http(activeChain.rpcUrls.default.http[0]),
  },
  ssr: false,
});
