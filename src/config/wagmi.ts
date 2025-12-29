import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { qieTestnet, qieMainnet, hardhatLocal } from './chains';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id';

export const config = getDefaultConfig({
  appName: 'BlindBid',
  projectId,
  chains: [qieTestnet, qieMainnet, hardhatLocal],
  transports: {
    [qieTestnet.id]: http('https://rpc1testnet.qie.digital/'),
    [qieMainnet.id]: http('https://rpc1mainnet.qie.digital/'),
    [hardhatLocal.id]: http('http://127.0.0.1:8545'),
  },
  ssr: false,
});
