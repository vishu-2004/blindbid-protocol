import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAccount, usePublicClient, useWriteContract, useBlockNumber } from 'wagmi';
import { type Address, type Abi, formatEther, parseEther } from 'viem';
import { getContractAddress } from '@/utils/contract';
import { getActiveNetwork } from '@/config/chains';
import VaultAuctionABI from '@/abi/VaultAuction.json';
import { toast } from '@/hooks/use-toast';

export interface NFTItem {
  nftAddress: Address;
  tokenId: bigint;
}

export interface VaultData {
  name: string;
  description: string;
  nfts: NFTItem[];
  seller: Address;
  currentBid: bigint;
  highestBidder: Address;
  lastBidTime: bigint;
  active: boolean;
  ended: boolean;
  startPrice: bigint;
}

export interface AuctionTiming {
  lastBidTime: bigint;
  bidWindow: bigint;
  endTime: bigint;
  active: boolean;
  ended: boolean;
}

export interface VerificationData {
  estimatedValueBand: {
    label: string;
    displayRange: string;
    confidence: string;
  };
  rarityBreakdown: {
    legendary: number;
    rare: number;
    common: number;
  };
  riskFlags: {
    freshMintDetected: boolean;
  };
}

export type AuctionView = 
  | 'seller-prestart' 
  | 'buyer-prestart' 
  | 'live' 
  | 'ended' 
  | 'cancelled'
  | 'loading'
  | 'not-found';

export const useAuctionDetail = (vaultId: string | undefined) => {
  const { address, isConnected } = useAccount();
  const activeChain = getActiveNetwork();
  const publicClient = usePublicClient({ chainId: activeChain.id });
  const { writeContractAsync, isPending: isWritePending } = useWriteContract();
  const { data: blockNumber } = useBlockNumber({ watch: true, chainId: activeChain.id });

  const [vaultData, setVaultData] = useState<VaultData | null>(null);
  const [timing, setTiming] = useState<AuctionTiming | null>(null);
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null);
  const [isSeller, setIsSeller] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [blockTimestamp, setBlockTimestamp] = useState<bigint>(BigInt(0));
  const [actionPending, setActionPending] = useState<string | null>(null);

  const contractAddress = getContractAddress();
  const BACKEND_URL = import.meta.env.VITE_API_BASE_URL;
  // Fetch block timestamp
  const fetchBlockTimestamp = useCallback(async () => {
    if (!publicClient) return;
    try {
      const block = await publicClient.getBlock();
      setBlockTimestamp(block.timestamp);
    } catch (err) {
      console.error('Failed to fetch block timestamp:', err);
    }
  }, [publicClient]);

  // Fetch vault data and timing
  const fetchVaultData = useCallback(async () => {
    if (!publicClient || !contractAddress || !vaultId) {
      setError('Contract not configured');
      setIsLoading(false);
      return;
    }

    try {
      const vaultIdBigInt = BigInt(vaultId);

      // Fetch all data in parallel
      const [vaultResult, timingResult, block] = await Promise.all([
        publicClient.readContract({
          address: contractAddress,
          abi: VaultAuctionABI.abi as Abi,
          functionName: 'getVaultWithAuction',
          args: [vaultIdBigInt],
        }),
        publicClient.readContract({
          address: contractAddress,
          abi: VaultAuctionABI.abi as Abi,
          functionName: 'getAuctionTiming',
          args: [vaultIdBigInt],
        }),
        publicClient.getBlock(),
      ]);

      const vault = vaultResult as [string, string, NFTItem[], Address, bigint, Address, bigint, boolean, boolean, bigint];
      const timingData = timingResult as [bigint, bigint, bigint, boolean, boolean];

      setVaultData({
        name: vault[0],
        description: vault[1],
        nfts: vault[2],
        seller: vault[3],
        currentBid: vault[4],
        highestBidder: vault[5],
        lastBidTime: vault[6],
        active: vault[7],
        ended: vault[8],
        startPrice: vault[9],
      });

      setTiming({
        lastBidTime: timingData[0],
        bidWindow: timingData[1],
        endTime: timingData[2],
        active: timingData[3],
        ended: timingData[4],
      });

      setBlockTimestamp(block.timestamp);

      // Fetch verification data from backend for each NFT
      try {
        const nftItems = vault[2] as NFTItem[];
        if (nftItems.length > 0) {
          const response = await fetch(`${BACKEND_URL}/api/vault/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              nfts: nftItems.map((nft: NFTItem) => ({
                contract: nft.nftAddress,
                tokenId: nft.tokenId.toString(),
              })),
            }),
          });
          
          if (response.ok) {
            const verifyResult = await response.json();

            if (verifyResult.approved) {
              setVerificationData({
                estimatedValueBand: verifyResult.summary.estimatedValueBand,
                rarityBreakdown: verifyResult.summary.rarityBreakdown,
                riskFlags: verifyResult.summary.riskFlags,
              });
            }
            console.log("cdsv",verifyResult);

          }
        }
      } catch (verifyErr) {
        console.error('Failed to fetch verification data:', verifyErr);
        // Continue without verification data
      }

      // Check if current user is seller
      if (address) {
        const sellerCheck = await publicClient.readContract({
          address: contractAddress,
          abi: VaultAuctionABI.abi as Abi,
          functionName: 'isVaultSeller',
          args: [vaultIdBigInt, address],
        });
        setIsSeller(sellerCheck as boolean);
      } else {
        setIsSeller(false);
      }

      setError(null);
    } catch (err) {
      console.error('Failed to fetch vault data:', err);
      setError('Failed to load auction data');
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, contractAddress, vaultId, address]);

  // Initial load
  useEffect(() => {
    fetchVaultData();
  }, [fetchVaultData]);

  // Refetch on new blocks
  useEffect(() => {
    if (blockNumber) {
      fetchBlockTimestamp();
      // Re-sync data on new blocks
      fetchVaultData();
    }
  }, [blockNumber, fetchBlockTimestamp, fetchVaultData]);

  // Calculate remaining time - lock to 0 once expired
  useEffect(() => {
    if (!timing || !blockTimestamp || timing.endTime === BigInt(0)) {
      setRemainingTime(0);
      return;
    }

    const calculateRemaining = () => {
      const now = blockTimestamp;
      const bidWindowEnd = timing.lastBidTime + timing.bidWindow;
      const auctionEnd = timing.endTime;
      
      // Remaining is min of endTime and (lastBidTime + bidWindow) - now
      const effectiveEnd = bidWindowEnd < auctionEnd ? bidWindowEnd : auctionEnd;
      const remaining = effectiveEnd > now ? Number(effectiveEnd - now) : 0;
      
      return remaining;
    };

    const remaining = calculateRemaining();
    
    // If already expired, lock at 0 and don't start interval
    if (remaining <= 0) {
      setRemainingTime(0);
      return;
    }
    
    setRemainingTime(remaining);

    // Update every second for smoother countdown
    const interval = setInterval(() => {
      setRemainingTime(prev => {
        const newValue = prev - 1;
        // Lock to 0 once expired
        if (newValue <= 0) {
          clearInterval(interval);
          return 0;
        }
        return newValue;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timing, blockTimestamp]);

  // Determine current view
  const currentView = useMemo((): AuctionView => {
    if (isLoading) return 'loading';
    if (error || !vaultData) return 'not-found';

    const { active, ended, startPrice, seller } = vaultData;

    // Cancelled: not active, not ended, but vault exists (startPrice could be 0 if cancelled)
    if (!active && !ended && startPrice === BigInt(0) && seller !== '0x0000000000000000000000000000000000000000') {
      return 'cancelled';
    }

    // Ended
    if (ended) return 'ended';

    // Live
    if (active && !ended) return 'live';

    // Pre-start: auction created but not started
    if (!active && !ended && startPrice > BigInt(0)) {
      return isSeller ? 'seller-prestart' : 'buyer-prestart';
    }

    return 'buyer-prestart';
  }, [isLoading, error, vaultData, isSeller]);

  // Check if on correct network
  const isCorrectNetwork = useMemo(() => {
    if (!isConnected) return false;
    return true; // wagmi handles network validation
  }, [isConnected]);

  // Action handlers
  const startAuction = useCallback(async () => {
    if (!contractAddress || !vaultId) return;
    
    setActionPending('start');
    try {
      await (writeContractAsync as any)({
        address: contractAddress,
        abi: VaultAuctionABI.abi as Abi,
        functionName: 'startAuction',
        args: [BigInt(vaultId)],
        chainId: activeChain.id,
      });
      
      toast({
        title: 'Auction Started!',
        description: 'Your auction is now live.',
      });
      
      await fetchVaultData();
    } catch (err: any) {
      console.error('Failed to start auction:', err);
      toast({
        title: 'Failed to Start Auction',
        description: err.shortMessage || err.message || 'Transaction failed',
        variant: 'destructive',
      });
    } finally {
      setActionPending(null);
    }
  }, [contractAddress, vaultId, writeContractAsync, activeChain.id, fetchVaultData]);

  const cancelAuction = useCallback(async () => {
    if (!contractAddress || !vaultId) return;
    
    setActionPending('cancelAuction');
    try {
      await (writeContractAsync as any)({
        address: contractAddress,
        abi: VaultAuctionABI.abi as Abi,
        functionName: 'cancelAuction',
        args: [BigInt(vaultId)],
        chainId: activeChain.id,
      });
      
      toast({
        title: 'Auction Cancelled',
        description: 'The auction has been cancelled.',
      });
      
      await fetchVaultData();
    } catch (err: any) {
      console.error('Failed to cancel auction:', err);
      toast({
        title: 'Failed to Cancel Auction',
        description: err.shortMessage || err.message || 'Transaction failed',
        variant: 'destructive',
      });
    } finally {
      setActionPending(null);
    }
  }, [contractAddress, vaultId, writeContractAsync, activeChain.id, fetchVaultData]);

  const cancelVault = useCallback(async () => {
    if (!contractAddress || !vaultId) return;
    
    setActionPending('cancelVault');
    try {
      await (writeContractAsync as any)({
        address: contractAddress,
        abi: VaultAuctionABI.abi as Abi,
        functionName: 'cancelVault',
        args: [BigInt(vaultId)],
        chainId: activeChain.id,
      });
      
      toast({
        title: 'Vault Cancelled',
        description: 'The vault has been cancelled and NFTs returned.',
      });
      
      await fetchVaultData();
    } catch (err: any) {
      console.error('Failed to cancel vault:', err);
      toast({
        title: 'Failed to Cancel Vault',
        description: err.shortMessage || err.message || 'Transaction failed',
        variant: 'destructive',
      });
    } finally {
      setActionPending(null);
    }
  }, [contractAddress, vaultId, writeContractAsync, activeChain.id, fetchVaultData]);

  const placeBid = useCallback(async () => {
    if (!contractAddress || !vaultId || !vaultData) return;
    
    const bidAmount = vaultData.currentBid + BigInt('100000000000000000'); // 0.1 QIE
    
    setActionPending('bid');
    try {
      await (writeContractAsync as any)({
        address: contractAddress,
        abi: VaultAuctionABI.abi as Abi,
        functionName: 'bid',
        args: [BigInt(vaultId)],
        value: bidAmount,
        chainId: activeChain.id,
      });
      
      toast({
        title: 'Bid Placed!',
        description: `You are now the highest bidder at ${formatEther(bidAmount)} QIE`,
      });
      
      await fetchVaultData();
    } catch (err: any) {
      console.error('Failed to place bid:', err);
      
      let errorMessage = err.shortMessage || err.message || 'Transaction failed';
      if (errorMessage.includes('Bid window expired')) {
        errorMessage = 'Bid window has expired. Someone else may have already won.';
      } else if (errorMessage.includes('Auction duration ended')) {
        errorMessage = 'The auction has ended.';
      }
      
      toast({
        title: 'Failed to Place Bid',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setActionPending(null);
    }
  }, [contractAddress, vaultId, vaultData, writeContractAsync, activeChain.id, fetchVaultData]);

  const endAuction = useCallback(async () => {
    if (!contractAddress || !vaultId) return;
    
    setActionPending('end');
    try {
      await (writeContractAsync as any)({
        address: contractAddress,
        abi: VaultAuctionABI.abi as Abi,
        functionName: 'endAuction',
        args: [BigInt(vaultId)],
        chainId: activeChain.id,
      });
      
      toast({
        title: 'Auction Ended',
        description: 'The auction has been finalized.',
      });
      
      await fetchVaultData();
    } catch (err: any) {
      console.error('Failed to end auction:', err);
      toast({
        title: 'Failed to End Auction',
        description: err.shortMessage || err.message || 'Transaction failed',
        variant: 'destructive',
      });
    } finally {
      setActionPending(null);
    }
  }, [contractAddress, vaultId, writeContractAsync, activeChain.id, fetchVaultData]);

  // Helper to format with max 3 decimal places
  const formatPrice = (value: bigint): string => {
    const formatted = formatEther(value);
    const num = parseFloat(formatted);
    // Use toFixed(3) but remove trailing zeros
    return num.toFixed(3).replace(/\.?0+$/, '') || '0';
  };

  // Formatted values
  const formattedCurrentBid = vaultData ? formatPrice(vaultData.currentBid) : '0';
  const formattedStartPrice = vaultData ? formatPrice(vaultData.startPrice) : '0';
  const nextBidAmount = vaultData ? formatPrice(vaultData.currentBid + BigInt('100000000000000000')) : '0'; // 0.1 QIE

  // Is highest bidder check (works during live auction)
  const isHighestBidder = useMemo(() => {
    if (!vaultData || !address) return false;
    return vaultData.highestBidder.toLowerCase() === address.toLowerCase();
  }, [vaultData, address]);

  // Is winner check (only after auction ended)
  const isWinner = useMemo(() => {
    if (!vaultData || !address) return false;
    return vaultData.ended && isHighestBidder;
  }, [vaultData, address, isHighestBidder]);

  // Bid safety check (disable bidding in last 5 seconds)
  const canBid = useMemo(() => {
    return remainingTime > 5 && currentView === 'live' && isConnected && !actionPending;
  }, [remainingTime, currentView, isConnected, actionPending]);

  return {
    vaultData,
    timing,
    verificationData,
    isSeller,
    isLoading,
    error,
    remainingTime,
    currentView,
    isConnected,
    isCorrectNetwork,
    actionPending,
    isWritePending,
    formattedCurrentBid,
    formattedStartPrice,
    nextBidAmount,
    isHighestBidder,
    isWinner,
    canBid,
    address,
    activeChain,
    startAuction,
    cancelAuction,
    cancelVault,
    placeBid,
    endAuction,
    refetch: fetchVaultData,
  };
};
