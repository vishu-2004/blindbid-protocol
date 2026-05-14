import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

interface AuctionSocketState {
  currentBid: string | null;
  highestBidder: string | null;
  lastBidTime: number | null;
  bidWindow: number | null;
  endTime: number | null;
  active: boolean | null;
  ended: boolean | null;
  startPrice: string | null;
}

interface BidPlacedEvent {
  type: 'bid:placed';
  vaultId: number;
  bidder: string;
  amount: string;
  currentBid: string;
  highestBidder: string;
  lastBidTime: number;
  bidWindow: number;
  endTime: number;
  active: boolean;
  ended: boolean;
  startPrice: string;
  serverTime: number;
}

interface AuctionStartedEvent {
  type: 'auction:started';
  vaultId: number;
  startTime: number;
  endTime: number;
  lastBidTime: number;
  bidWindow: number;
  active: boolean;
  ended: boolean;
  currentBid: string;
  highestBidder: string;
  startPrice: string;
  serverTime: number;
}

interface AuctionEndedEvent {
  type: 'auction:ended';
  vaultId: number;
  winner: string;
  finalPrice: string;
  active: boolean;
  ended: boolean;
  serverTime: number;
}

interface TimeSyncEvent {
  serverTime: number;
}

// Singleton socket connection — shared across all hooks
let globalSocket: Socket | null = null;
let refCount = 0;

function getSocket(): Socket {
  if (!globalSocket) {
    globalSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity,
    });
  }
  refCount++;
  return globalSocket;
}

function releaseSocket() {
  refCount--;
  if (refCount <= 0 && globalSocket) {
    globalSocket.disconnect();
    globalSocket = null;
    refCount = 0;
  }
}

/**
 * Hook to subscribe to real-time auction events via Socket.IO
 * Provides server-synced time and live auction state updates.
 * 
 * IMPORTANT: Socket events are an ACCELERATOR, not the sole data source.
 * The useAuctionDetail hook always refetches from chain on new blocks
 * as the ground-truth fallback. Socket events just make updates faster.
 */
export const useAuctionSocket = (vaultId: string | undefined) => {
  const socketRef = useRef<Socket | null>(null);
  const [serverTime, setServerTime] = useState<number>(Date.now());
  const [socketState, setSocketState] = useState<AuctionSocketState>({
    currentBid: null,
    highestBidder: null,
    lastBidTime: null,
    bidWindow: null,
    endTime: null,
    active: null,
    ended: null,
    startPrice: null,
  });
  const [lastBidEvent, setLastBidEvent] = useState<BidPlacedEvent | null>(null);
  const [lastStartedEvent, setLastStartedEvent] = useState<AuctionStartedEvent | null>(null);
  const [lastEndedEvent, setLastEndedEvent] = useState<AuctionEndedEvent | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  // Increments on ANY auction event — used by useAuctionDetail to trigger refetch
  const [refetchSignal, setRefetchSignal] = useState(0);

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    const onConnect = () => {
      setIsConnected(true);
      if (vaultId) {
        socket.emit('join:auction', vaultId);
      }
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    const onTimeSync = (data: TimeSyncEvent) => {
      setServerTime(data.serverTime);
    };

    const onBidPlaced = (data: BidPlacedEvent) => {
      setSocketState({
        currentBid: data.currentBid,
        highestBidder: data.highestBidder,
        lastBidTime: data.lastBidTime,
        bidWindow: data.bidWindow,
        endTime: data.endTime,
        active: data.active,
        ended: data.ended,
        startPrice: data.startPrice,
      });
      setLastBidEvent(data);
      setServerTime(data.serverTime);
      setRefetchSignal((prev) => prev + 1);
    };

    const onAuctionStarted = (data: AuctionStartedEvent) => {
      setSocketState({
        currentBid: data.currentBid,
        highestBidder: data.highestBidder,
        lastBidTime: data.lastBidTime,
        bidWindow: data.bidWindow,
        endTime: data.endTime,
        active: data.active,
        ended: data.ended,
        startPrice: data.startPrice,
      });
      setLastStartedEvent(data);
      setServerTime(data.serverTime);
      setRefetchSignal((prev) => prev + 1);
    };

    const onAuctionEnded = (data: AuctionEndedEvent) => {
      setSocketState((prev) => ({
        ...prev,
        active: data.active,
        ended: data.ended,
      }));
      setLastEndedEvent(data);
      setServerTime(data.serverTime);
      setRefetchSignal((prev) => prev + 1);
    };

    const onAuctionCancelled = () => {
      setRefetchSignal((prev) => prev + 1);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('time:sync', onTimeSync);
    socket.on('bid:placed', onBidPlaced);
    socket.on('auction:started', onAuctionStarted);
    socket.on('auction:ended', onAuctionEnded);
    socket.on('auction:cancelled', onAuctionCancelled);

    // If already connected, join the room immediately
    if (socket.connected && vaultId) {
      socket.emit('join:auction', vaultId);
    }

    return () => {
      if (vaultId) {
        socket.emit('leave:auction', vaultId);
      }
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('time:sync', onTimeSync);
      socket.off('bid:placed', onBidPlaced);
      socket.off('auction:started', onAuctionStarted);
      socket.off('auction:ended', onAuctionEnded);
      socket.off('auction:cancelled', onAuctionCancelled);
      socketRef.current = null;
      releaseSocket();
    };
  }, [vaultId]);

  // Clear event callbacks after they're consumed
  const clearLastBidEvent = useCallback(() => {
    setLastBidEvent(null);
  }, []);
  const clearLastStartedEvent = useCallback(() => {
    setLastStartedEvent(null);
  }, []);
  const clearLastEndedEvent = useCallback(() => {
    setLastEndedEvent(null);
  }, []);

  return {
    serverTime,
    socketState,
    lastBidEvent,
    clearLastBidEvent,
    lastStartedEvent,
    clearLastStartedEvent,
    lastEndedEvent,
    clearLastEndedEvent,
    isConnected,
    refetchSignal,
  };
};

/**
 * Lightweight hook for the auctions list page
 * Only subscribes to global auction:update events
 */
export const useAuctionListSocket = () => {
  const [updateEvent, setUpdateEvent] = useState<{
    vaultId: number;
    currentBid?: string;
    active?: boolean;
    ended?: boolean;
  } | null>(null);

  useEffect(() => {
    const socket = getSocket();

    const onUpdate = (data: { vaultId: number; currentBid?: string; active?: boolean; ended?: boolean }) => {
      setUpdateEvent(data);
    };

    socket.on('auction:update', onUpdate);

    return () => {
      socket.off('auction:update', onUpdate);
      releaseSocket();
    };
  }, []);

  const clearUpdateEvent = useCallback(() => {
    setUpdateEvent(null);
  }, []);

  return { updateEvent, clearUpdateEvent };
};
