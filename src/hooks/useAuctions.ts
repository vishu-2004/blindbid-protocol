import { useState, useEffect, useCallback } from 'react';
import { readVaultAuction, isContractConfigured } from '@/utils/contract';
import { formatEther } from 'viem';

export interface AuctionCardData {
  vaultId: number;
  name: string;
  description: string;
  isLive: boolean;
  isEnded: boolean;
  timeRemaining: number;
  minimumPrice: string;
  minimumPriceRaw: bigint;
}

interface UseAuctionsResult {
  auctions: AuctionCardData[];
  pendingAuctions: AuctionCardData[];
  liveAuctions: AuctionCardData[];
  endedAuctions: AuctionCardData[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useAuctions = (pollInterval = 12000): UseAuctionsResult => {
  const [auctions, setAuctions] = useState<AuctionCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAuctions = useCallback(async () => {
    if (!isContractConfigured()) {
      setError('Contract not configured');
      setIsLoading(false);
      return;
    }

    try {
      // Get all auction vault IDs
      const vaultIds = await readVaultAuction<bigint[]>('getAllAuctions');
      console.log("all auct ids",vaultIds)
      if (vaultIds.length === 0) {
        setAuctions([]);
        setIsLoading(false);
        return;
      }

      // Fetch card data for each vault
      const auctionPromises = vaultIds.map(async (vaultId) => {
        try {
          const cardData = await readVaultAuction<[string, string, boolean, boolean, bigint, bigint]>(
            'getAuctionCard',
            [vaultId]
          );

          const [name, description, isLive, isEnded, timeRemaining, minimumPrice] = cardData;

          return {
            vaultId: Number(vaultId),
            name,
            description,
            isLive,
            isEnded,
            timeRemaining: Number(timeRemaining),
            minimumPrice: parseFloat(formatEther(minimumPrice)).toFixed(3).replace(/\.?0+$/, '') || '0',
            minimumPriceRaw: minimumPrice,
          };
        } catch (err) {
          console.error(`Error fetching auction ${vaultId}:`, err);
          return null;
        }
      });

      const results = await Promise.all(auctionPromises);
      const validAuctions = results.filter((a): a is AuctionCardData => a !== null);

      setAuctions(validAuctions);
      setError(null);
    } catch (err) {
      console.error('Error fetching auctions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch auctions');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  // Poll for updates (simulates block-based updates)
  useEffect(() => {
    if (pollInterval <= 0) return;

    const interval = setInterval(() => {
      fetchAuctions();
    }, pollInterval);

    return () => clearInterval(interval);
  }, [fetchAuctions, pollInterval]);

  // Decrement timeRemaining locally every second for live auctions
  useEffect(() => {
    const timer = setInterval(() => {
      setAuctions((prev) =>
        prev.map((auction) => {
          // Only decrement for live auctions
          if (auction.isLive && !auction.isEnded && auction.timeRemaining > 0) {
            const newTimeRemaining = auction.timeRemaining - 1;
            return {
              ...auction,
              timeRemaining: newTimeRemaining,
              // Auto-mark as ended if time hits 0
              isLive: newTimeRemaining > 0,
              isEnded: newTimeRemaining <= 0 ? true : auction.isEnded,
            };
          }
          return auction;
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Filter pending, live and ended auctions
  const pendingAuctions = auctions.filter((a) => !a.isLive && !a.isEnded);
  const liveAuctions = auctions.filter((a) => a.isLive && !a.isEnded);
  const endedAuctions = auctions.filter((a) => a.isEnded);

  return {
    auctions,
    pendingAuctions,
    liveAuctions,
    endedAuctions,
    isLoading,
    error,
    refetch: fetchAuctions,
  };
};
