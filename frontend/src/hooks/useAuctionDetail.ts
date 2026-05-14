import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAccount, usePublicClient, useWriteContract, useBlockNumber } from 'wagmi';
import { type Address, type Abi, formatEther, parseEther } from 'viem';
import { getContractAddress } from '@/utils/contract';
import { getActiveNetwork } from '@/config/chains';
import VaultAuctionABI from '@/abi/VaultAuction.json';
import { toast } from '@/hooks/use-toast';
import { useAuctionSocket } from '@/hooks/useAuctionSocket';

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

  // Socket.IO for real-time sync
  const {
    serverTime,
    socketState,
    lastBidEvent,
    clearLastBidEvent,
    lastStartedEvent,
    clearLastStartedEvent,
    lastEndedEvent,
    clearLastEndedEvent,
    isConnected: socketConnected,
    refetchSignal,
  } = useAuctionSocket(vaultId);

  const [vaultData, setVaultData] = useState<VaultData | null>(null);
  const [timing, setTiming] = useState<AuctionTiming | null>(null);
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null);
  const [isSeller, setIsSeller] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [actionPending, setActionPending] = useState<string | null>(null);
  const [optimisticBid, setOptimisticBid] = useState<{ currentBid: bigint; highestBidder: Address; lastBidTime: bigint } | null>(null);
  const [newBidFlash, setNewBidFlash] = useState(false);

  // Track last fetch block to avoid redundant re-fetches
  const lastFetchBlock = useRef<bigint | null>(null);
  // Track server time offset for accurate local interpolation
  const serverTimeOffset = useRef<number>(0);
  // Track if verification data was already fetched to avoid refetching
  const verificationFetched = useRef(false);

  const contractAddress = getContractAddress();
  const BACKEND_URL = import.meta.env.VITE_API_BASE_URL;

  // Update server time offset whenever we get a sync
  useEffect(() => {
    serverTimeOffset.current = serverTime - Date.now();
  }, [serverTime]);

  // ─── FETCH CORE DATA (vault + timing + seller check) ─────────
  // This is lightweight — only reads contract state, no verification API
  const fetchCoreData = useCallback(async () => {
    if (!publicClient || !contractAddress || !vaultId) {
      setError('Contract not configured');
      setIsLoading(false);
      return;
    }

    try {
      const vaultIdBigInt = BigInt(vaultId);

      // Fetch vault data and timing in parallel
      const [vaultResult, timingResult] = await Promise.all([
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

      // Clear optimistic bid once we get confirmed data
      setOptimisticBid(null);

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

  // ─── FETCH VERIFICATION DATA (heavy, only once) ──────────────
  const fetchVerificationData = useCallback(async () => {
    if (verificationFetched.current || !vaultData || !BACKEND_URL) return;

    try {
      const nftItems = vaultData.nfts;
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
        }
      }
      verificationFetched.current = true;
    } catch (verifyErr) {
      console.error('Failed to fetch verification data:', verifyErr);
    }
  }, [vaultData, BACKEND_URL]);

  // Full initial load
  const fetchVaultData = useCallback(async () => {
    await fetchCoreData();
  }, [fetchCoreData]);

  // Initial load
  useEffect(() => {
    fetchVaultData();
  }, [fetchVaultData]);

  // Fetch verification data once vault data is available
  useEffect(() => {
    if (vaultData && !verificationFetched.current) {
      fetchVerificationData();
    }
  }, [vaultData, fetchVerificationData]);

  // ─── BLOCK-BASED POLLING (ALWAYS ACTIVE) ─────────────────────
  // This is the GROUND TRUTH. Always refetch on new blocks.
  // Socket events provide faster updates, but this guarantees
  // the UI always reflects chain state within one block.
  useEffect(() => {
    if (blockNumber && blockNumber !== lastFetchBlock.current) {
      lastFetchBlock.current = blockNumber;
      fetchCoreData();
    }
  }, [blockNumber, fetchCoreData]);

  // ─── SOCKET EVENT REFETCH (ACCELERATOR) ──────────────────────
  // When the backend detects a contract event via Socket.IO,
  // immediately refetch from chain for confirmed data.
  // This fires BEFORE the next block poll, making updates near-instant.
  const lastRefetchSignal = useRef(0);
  useEffect(() => {
    if (refetchSignal > 0 && refetchSignal !== lastRefetchSignal.current) {
      lastRefetchSignal.current = refetchSignal;
      fetchCoreData();
    }
  }, [refetchSignal, fetchCoreData]);

  // ─── QUICK SOCKET STATE PREVIEW ──────────────────────────────
  // Apply socket state immediately for fastest visual update.
  // This runs before the chain refetch completes, so the user
  // sees the update within ~100ms instead of waiting for RPC.
  useEffect(() => {
    if (socketState.currentBid == null || !vaultData) return;

    setVaultData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        currentBid: BigInt(socketState.currentBid!),
        highestBidder: (socketState.highestBidder || prev.highestBidder) as Address,
        lastBidTime: BigInt(socketState.lastBidTime || 0),
        active: socketState.active ?? prev.active,
        ended: socketState.ended ?? prev.ended,
      };
    });

    if (socketState.lastBidTime && socketState.bidWindow && socketState.endTime) {
      setTiming((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          lastBidTime: BigInt(socketState.lastBidTime!),
          bidWindow: BigInt(socketState.bidWindow!),
          endTime: BigInt(socketState.endTime!),
          active: socketState.active ?? prev.active,
          ended: socketState.ended ?? prev.ended,
        };
      });
    }

    // Clear optimistic bid since we now have confirmed state
    setOptimisticBid(null);
  }, [socketState]);

  // Flash effect when another user places a bid
  useEffect(() => {
    if (!lastBidEvent || !address) return;
    
    // Only flash for bids from OTHER users
    if (lastBidEvent.bidder.toLowerCase() !== address.toLowerCase()) {
      setNewBidFlash(true);
      const timeout = setTimeout(() => setNewBidFlash(false), 1500);

      // Show toast to seller when a new bid is placed (no bidder address)
      if (isSeller) {
        const bidAmountMon = formatEther(BigInt(lastBidEvent.currentBid));
        toast({
          title: '🔔 New Bid Received!',
          description: `A new bid of ${bidAmountMon} MON has been placed on your auction.`,
        });
      }

      clearLastBidEvent();
      return () => clearTimeout(timeout);
    }
    clearLastBidEvent();
  }, [lastBidEvent, address, clearLastBidEvent, isSeller]);

  // Toast to seller when auction starts (via socket event from another tab/user)
  useEffect(() => {
    if (!lastStartedEvent) return;

    if (isSeller) {
      toast({
        title: '🚀 Auction Started!',
        description: `Your auction "${vaultData?.name || `#${vaultId}`}" is now live and accepting bids.`,
      });
    }

    clearLastStartedEvent();
  }, [lastStartedEvent, isSeller, vaultData?.name, vaultId, clearLastStartedEvent]);

  // Toast to seller when auction ends
  useEffect(() => {
    if (!lastEndedEvent) return;

    if (isSeller && lastEndedEvent.finalPrice) {
      const finalMon = formatEther(BigInt(lastEndedEvent.finalPrice));
      toast({
        title: '🏁 Auction Ended!',
        description: `Your auction has been finalized at ${finalMon} MON.`,
      });
    }

    clearLastEndedEvent();
  }, [lastEndedEvent, isSeller, clearLastEndedEvent]);

  // ─── SERVER-SYNCED TIMER ─────────────────────────────────────
  // Uses server time from Socket.IO heartbeat for synchronized countdown
  useEffect(() => {
    if (!timing || timing.endTime === BigInt(0)) {
      setRemainingTime(0);
      return;
    }

    const calculateRemaining = () => {
      // Use server-synced time: local time + offset from last server sync
      const nowMs = Date.now() + serverTimeOffset.current;
      const nowSeconds = Math.floor(nowMs / 1000);
      
      // Get the effective timing values (use optimistic if available)
      const effectiveLastBidTime = optimisticBid ? Number(optimisticBid.lastBidTime) : Number(timing.lastBidTime);
      const bidWindowEnd = effectiveLastBidTime + Number(timing.bidWindow);
      const auctionEnd = Number(timing.endTime);
      
      // Remaining is min of endTime and (lastBidTime + bidWindow) minus now
      const effectiveEnd = Math.min(bidWindowEnd, auctionEnd);
      const remaining = effectiveEnd > nowSeconds ? effectiveEnd - nowSeconds : 0;
      
      return remaining;
    };

    const remaining = calculateRemaining();
    
    // If already expired, lock at 0
    if (remaining <= 0) {
      setRemainingTime(0);
      return;
    }
    
    setRemainingTime(remaining);

    // Update every second — recalculates from server-synced time
    const interval = setInterval(() => {
      const newRemaining = calculateRemaining();
      if (newRemaining <= 0) {
        setRemainingTime(0);
        clearInterval(interval);
      } else {
        setRemainingTime(newRemaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timing, optimisticBid, serverTime]);

  // Handle tab visibility — re-sync timer when tab becomes visible
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Refetch chain data when tab becomes visible
        fetchCoreData();
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [fetchCoreData]);

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

  // ─── ACTION HANDLERS ─────────────────────────────────────────

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
      
      // Refetch immediately to update local state
      await fetchCoreData();
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
  }, [contractAddress, vaultId, writeContractAsync, activeChain.id, fetchCoreData]);

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
      
      await fetchCoreData();
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
  }, [contractAddress, vaultId, writeContractAsync, activeChain.id, fetchCoreData]);

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
      
      await fetchCoreData();
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
  }, [contractAddress, vaultId, writeContractAsync, activeChain.id, fetchCoreData]);

  const placeBid = useCallback(async () => {
    if (!contractAddress || !vaultId || !vaultData) return;
    
    const currentBid = optimisticBid ? optimisticBid.currentBid : vaultData.currentBid;
    const bidAmount = currentBid + BigInt('100000000000000000'); // 0.1 MON
    
    setActionPending('bid');
    try {
      // Apply optimistic update BEFORE the transaction
      const nowSeconds = Math.floor((Date.now() + serverTimeOffset.current) / 1000);
      setOptimisticBid({
        currentBid: bidAmount,
        highestBidder: address as Address,
        lastBidTime: BigInt(nowSeconds),
      });

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
        description: `You are now the highest bidder at ${formatEther(bidAmount)} MON`,
      });
      
      // Refetch to get confirmed chain state
      await fetchCoreData();
    } catch (err: any) {
      console.error('Failed to place bid:', err);
      
      // Revert optimistic update on failure
      setOptimisticBid(null);
      
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
  }, [contractAddress, vaultId, vaultData, optimisticBid, address, writeContractAsync, activeChain.id, fetchCoreData]);

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
      
      await fetchCoreData();
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
  }, [contractAddress, vaultId, writeContractAsync, activeChain.id, fetchCoreData]);

  // ─── COMPUTED VALUES ─────────────────────────────────────────

  // Helper to format with max 4 decimal places
  const formatPrice = (value: bigint): string => {
    const formatted = formatEther(value);
    const num = parseFloat(formatted);
    // Use toFixed(4) but remove trailing zeros
    return num.toFixed(4).replace(/\.?0+$/, '') || '0';
  };

  // Use optimistic values if available, otherwise use chain-confirmed data
  const effectiveCurrentBid = optimisticBid ? optimisticBid.currentBid : (vaultData?.currentBid ?? BigInt(0));
  const effectiveHighestBidder = optimisticBid ? optimisticBid.highestBidder : (vaultData?.highestBidder ?? '0x0000000000000000000000000000000000000000' as Address);

  // Formatted values
  const formattedCurrentBid = formatPrice(effectiveCurrentBid);
  const formattedStartPrice = vaultData ? formatPrice(vaultData.startPrice) : '0';
  const nextBidAmount = formatPrice(effectiveCurrentBid + BigInt('100000000000000000')); // 0.1 MON

  // Is highest bidder check (works during live auction)
  const isHighestBidder = useMemo(() => {
    if (!address) return false;
    return effectiveHighestBidder.toLowerCase() === address.toLowerCase();
  }, [effectiveHighestBidder, address]);

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
    newBidFlash,
    socketConnected,
    startAuction,
    cancelAuction,
    cancelVault,
    placeBid,
    endAuction,
    refetch: fetchVaultData,
  };
};
