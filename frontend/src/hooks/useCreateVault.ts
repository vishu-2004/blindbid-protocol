import { useState, useCallback } from 'react';
import { useWriteContract, usePublicClient } from 'wagmi';
import { type Address, type Abi, parseEther } from 'viem';
import { getContractAddress } from '@/utils/contract';
import { getActiveNetwork } from '@/config/chains';
import VaultAuctionABI from '@/abi/VaultAuction.json';

const activeChain = getActiveNetwork();

export type Step = 1 | 2 | 3;

interface NFTInfo {
  nftAddress: Address;
  tokenIds: bigint[];
}

// Backend verification response types
export interface RarityBreakdown {
  legendary: number;
  rare: number;
  common: number;
}

export interface EstimatedValueBand {
  label: string;
  displayRange: string;
  confidence: string;
}

export interface RiskFlags {
  freshMintDetected: boolean;
}

export interface VerificationSummary {
  totalNFTs: number;
  startPrice: number;
  unit: string;
  estimatedValueBand: EstimatedValueBand;
  rarityBreakdown: RarityBreakdown;
  riskFlags: RiskFlags;
}

export interface VerificationResult {
  status: string;
  approved: boolean;
  reason: string;
  summary: VerificationSummary;
}

interface UseCreateVaultResult {
  currentStep: Step;
  isProcessing: boolean;
  nftInfo: NFTInfo | null;
  vaultId: bigint | null;
  error: string | null;
  success: string | null;
  verificationResult: VerificationResult | null;
  maxStartPrice: number | null;
  
  // Step 1
  verifyAndApproveNFTs: (nftAddress: string, tokenIds: string) => Promise<boolean>;
  
  // Step 2
  createVault: (name: string, description: string) => Promise<boolean>;
  
  // Step 3
  createAuction: (startPrice: string, durationMinutes: number) => Promise<boolean>;
  
  reset: () => void;
}
if(!import.meta.env.VITE_API_BASE_URL){
  throw new Error("API base url not set");
}
const BACKEND_URL = import.meta.env.VITE_API_BASE_URL;

export const useCreateVault = (): UseCreateVaultResult => {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [nftInfo, setNftInfo] = useState<NFTInfo | null>(null);
  const [vaultId, setVaultId] = useState<bigint | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [maxStartPrice, setMaxStartPrice] = useState<number | null>(null);

  const publicClient = usePublicClient({ chainId: activeChain.id });
  const { writeContractAsync } = useWriteContract();

  const contractAddress = getContractAddress();

  // Reset state
  const reset = useCallback(() => {
    setCurrentStep(1);
    setIsProcessing(false);
    setNftInfo(null);
    setVaultId(null);
    setError(null);
    setSuccess(null);
    setVerificationResult(null);
    setMaxStartPrice(null);
  }, []);

  // Clear messages
  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  // Parse token IDs from comma-separated string
  const parseTokenIds = (input: string): bigint[] => {
    return input
      .split(',')
      .map((id) => id.trim())
      .filter((id) => id !== '')
      .map((id) => BigInt(id));
  };

  // Step 1: Verify NFT ownership and approve
  const verifyAndApproveNFTs = useCallback(
    async (nftAddress: string, tokenIdsInput: string): Promise<boolean> => {
      clearMessages();
      setIsProcessing(true);

      try {
        if (!contractAddress) {
          throw new Error('Contract address not configured');
        }

        const address = nftAddress as Address;
        const tokenIds = parseTokenIds(tokenIdsInput);

        if (tokenIds.length === 0) {
          throw new Error('Please enter at least one token ID');
        }

        // Step 1a: Call backend verification API
        const nftsPayload = tokenIds.map((tokenId) => ({
          contract: nftAddress,
          tokenId: tokenId.toString(),
        }));

        const verifyResponse = await fetch(`${BACKEND_URL}/api/vault/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ nfts: nftsPayload }),
        });

        if (!verifyResponse.ok) {
          const errorData = await verifyResponse.json();
          throw new Error(errorData.error || 'Verification failed');
        }

        const verifyData: VerificationResult = await verifyResponse.json();

        if (!verifyData.approved) {
          throw new Error(verifyData.reason || 'NFTs not approved');
        }

        // Store verification result and max start price
        setVerificationResult(verifyData);
        setMaxStartPrice(verifyData.summary.startPrice);

        // Store NFT info for next steps
        setNftInfo({ nftAddress: address, tokenIds });

        // Step 1b: Approve contract for all tokens using setApprovalForAll
        const ERC721_ABI = [
          {
            inputs: [
              { name: 'operator', type: 'address' },
              { name: 'approved', type: 'bool' },
            ],
            name: 'setApprovalForAll',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
          },
        ];

        const hash = await writeContractAsync({
          address,
          abi: ERC721_ABI as Abi,
          functionName: 'setApprovalForAll',
          args: [contractAddress, true],
          chainId: activeChain.id,
        } as any);

        // Wait for transaction confirmation
        await publicClient?.waitForTransactionReceipt({ hash });

        setSuccess('NFTs verified and approved successfully');
        setCurrentStep(2);
        setIsProcessing(false);
        return true;
      } catch (err) {
        console.error('Verification/Approval error:', err);
        setError(err instanceof Error ? err.message : 'Failed to verify/approve NFTs');
        setIsProcessing(false);
        return false;
      }
    },
    [contractAddress, publicClient, writeContractAsync]
  );

  // Step 2: Create vault
  const createVault = useCallback(
    async (name: string, description: string): Promise<boolean> => {
      clearMessages();
      setIsProcessing(true);

      try {
        if (!contractAddress) {
          throw new Error('Contract address not configured');
        }

        if (!nftInfo) {
          throw new Error('NFT info not found. Please complete Step 1.');
        }

        if (!name.trim()) {
          throw new Error('Please enter a vault name');
        }

        // Get current vault count to predict the new vaultId
        const currentVaultCount = await publicClient?.readContract({
          address: contractAddress,
          abi: VaultAuctionABI.abi as Abi,
          functionName: 'vaultCount',
        });

        const predictedVaultId = currentVaultCount as bigint;

        // Create vault with all NFTs using the same address
        const nftAddresses = nftInfo.tokenIds.map(() => nftInfo.nftAddress);

        const hash = await writeContractAsync({
          address: contractAddress,
          abi: VaultAuctionABI.abi as Abi,
          functionName: 'createVault',
          args: [nftAddresses, nftInfo.tokenIds, name, description],
          chainId: activeChain.id,
        } as any);

        // Wait for transaction confirmation
        await publicClient?.waitForTransactionReceipt({ hash });

        setVaultId(predictedVaultId);
        setSuccess('Vault created successfully');
        setCurrentStep(3);
        setIsProcessing(false);
        return true;
      } catch (err) {
        console.error('Create vault error:', err);
        setError(err instanceof Error ? err.message : 'Failed to create vault');
        setIsProcessing(false);
        return false;
      }
    },
    [contractAddress, nftInfo, publicClient, writeContractAsync]
  );

  // Step 3: Create auction
  const createAuction = useCallback(
    async (startPrice: string, durationMinutes: number): Promise<boolean> => {
      clearMessages();
      setIsProcessing(true);

      try {
        if (!contractAddress) {
          throw new Error('Contract address not configured');
        }

        if (vaultId === null) {
          throw new Error('Vault ID not found. Please complete Step 2.');
        }

        if (!startPrice || parseFloat(startPrice) <= 0) {
          throw new Error('Please enter a valid start price');
        }

        // Validate against max start price from backend
        if (maxStartPrice !== null && parseFloat(startPrice) > maxStartPrice) {
          throw new Error(`Start price cannot exceed ${maxStartPrice} QIE (backend limit)`);
        }

        if (durationMinutes <= 0) {
          throw new Error('Please enter a valid duration');
        }

        const startPriceWei = parseEther(startPrice);
        const durationSeconds = BigInt(durationMinutes * 60);

        const hash = await writeContractAsync({
          address: contractAddress,
          abi: VaultAuctionABI.abi as Abi,
          functionName: 'createAuction',
          args: [vaultId, startPriceWei, durationSeconds],
          chainId: activeChain.id,
        } as any);

        // Wait for transaction confirmation
        await publicClient?.waitForTransactionReceipt({ hash });

        setSuccess('Auction created successfully');
        setIsProcessing(false);
        return true;
      } catch (err) {
        console.error('Create auction error:', err);
        setError(err instanceof Error ? err.message : 'Failed to create auction');
        setIsProcessing(false);
        return false;
      }
    },
    [contractAddress, vaultId, maxStartPrice, publicClient, writeContractAsync]
  );

  return {
    currentStep,
    isProcessing,
    nftInfo,
    vaultId,
    error,
    success,
    verificationResult,
    maxStartPrice,
    verifyAndApproveNFTs,
    createVault,
    createAuction,
    reset,
  };
};
