import { type Address, type Abi, createPublicClient, http } from 'viem';
import { getActiveNetwork } from '@/config/chains';
import VaultAuctionABI from '@/abi/VaultAuction.json';

// Get the contract address based on active network
export const getContractAddress = (): Address | null => {
  const network = import.meta.env.VITE_ACTIVE_NETWORK || 'testnet';
  
  switch (network) {
    case 'local':
      return (import.meta.env.VITE_VAULT_AUCTION_ADDRESS_LOCAL as Address) || null;
    case 'mainnet':
      return (import.meta.env.VITE_VAULT_AUCTION_ADDRESS_MAINNET as Address) || null;
    case 'testnet':
    default:
      return (import.meta.env.VITE_VAULT_AUCTION_ADDRESS_TESTNET as Address) || null;
  }
};

// Create public client for read operations
const getPublicClient = () => {
  const chain = getActiveNetwork();
  return createPublicClient({
    chain,
    transport: http(chain.rpcUrls.default.http[0]),
  });
};

// Read from VaultAuction contract
export const readVaultAuction = async <T>(
  functionName: string,
  args: unknown[] = []
): Promise<T> => {
  const address = getContractAddress();
  
  if (!address) {
    throw new Error('Contract address not configured for current network');
  }

  const client = getPublicClient();
  
  const result = await client.readContract({
    address,
    abi: VaultAuctionABI.abi as Abi,
    functionName,
    args,
  });

  return result as T;
};

// Prepare write params for use with wagmi useWriteContract hook
export const getWriteParams = (
  functionName: string,
  args: unknown[] = [],
  value?: bigint
) => {
  const address = getContractAddress();
  
  if (!address) {
    throw new Error('Contract address not configured for current network');
  }

  return {
    address,
    abi: VaultAuctionABI.abi as Abi,
    functionName,
    args,
    ...(value && { value }),
  };
};

// Check if contract is configured
export const isContractConfigured = (): boolean => {
  return getContractAddress() !== null;
};

// Get current network name
export const getCurrentNetwork = (): string => {
  return import.meta.env.VITE_ACTIVE_NETWORK || 'testnet';
};
