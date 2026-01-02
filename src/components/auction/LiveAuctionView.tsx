import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Shield, Zap, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CountdownTimer } from './CountdownTimer';
import { RarityCard, generateRarityDistribution } from './RarityCard';
import { AddressDisplay } from './AddressDisplay';
import { AuctionVerificationInfo, generateVerificationData } from './AuctionVerificationInfo';
import { type VaultData } from '@/hooks/useAuctionDetail';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { type Chain } from 'viem';

interface LiveAuctionViewProps {
  vaultData: VaultData;
  remainingTime: number;
  formattedCurrentBid: string;
  nextBidAmount: string;
  isConnected: boolean;
  canBid: boolean;
  actionPending: string | null;
  isSeller: boolean;
  isHighestBidder: boolean;
  activeChain: Chain;
  onPlaceBid: () => void;
  onEndAuction: () => void;
}

export const LiveAuctionView = ({
  vaultData,
  remainingTime,
  formattedCurrentBid,
  nextBidAmount,
  isConnected,
  canBid,
  actionPending,
  isSeller,
  isHighestBidder,
  activeChain,
  onPlaceBid,
  onEndAuction,
}: LiveAuctionViewProps) => {
  const rarityDistribution = useMemo(() => {
    return generateRarityDistribution(vaultData.nfts.length);
  }, [vaultData.nfts.length]);
  
  // Generate verification data from backend (mock for now based on NFT count)
  const verificationData = useMemo(() => {
    return generateVerificationData(vaultData.nfts.length);
  }, [vaultData.nfts.length]);

  const showEndButton = remainingTime === 0 && (isSeller || isHighestBidder);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header with pulse effect for live */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/20 border border-green-500/30">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-green-400 text-sm font-medium">LIVE</span>
          </span>
        </motion.div>

        <h1 className="text-3xl font-bold text-foreground">{vaultData.name}</h1>
        <p className="text-muted-foreground max-w-md mx-auto">{vaultData.description}</p>
        
        <div>
          <AddressDisplay address={vaultData.seller} label="Verified Seller" className="justify-center" />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Vault Preview */}
        <div className="space-y-6">
          {/* Verification Info from Backend */}
          <Card className="glass-gold p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Vault Valuation
            </h3>
            
            <AuctionVerificationInfo
              estimatedValueBand={verificationData.estimatedValueBand}
              rarityBreakdown={verificationData.rarityBreakdown}
              riskFlags={verificationData.riskFlags}
            />

            <p className="text-center text-sm text-muted-foreground mt-4">
              Contents will be revealed after auction ends
            </p>
          </Card>
        </div>

        {/* Right: Bidding Area */}
        <div className="space-y-6">
          {/* Countdown Timer */}
          <Card className="glass p-6 flex flex-col items-center">
            <CountdownTimer remainingTime={remainingTime} />
          </Card>

          {/* Current Bid */}
          <Card className="glass-gold p-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Current Highest Bid</p>
              <motion.p
                key={formattedCurrentBid}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="text-4xl font-bold text-primary mb-2"
              >
                {formattedCurrentBid} QIE
              </motion.p>
              <AddressDisplay 
                address={vaultData.highestBidder} 
                className="justify-center"
              />
            </div>
          </Card>

          {/* Bid Action */}
          <Card className="glass p-6 space-y-4">
            {!isConnected ? (
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">Connect your wallet to place a bid</p>
                <ConnectButton />
              </div>
            ) : isSeller ? (
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Shield className="w-5 h-5" />
                  <span>You are the seller of this auction</span>
                </div>
                {showEndButton && (
                  <Button
                    className="w-full h-14 gradient-gold text-primary-foreground font-semibold text-lg"
                    onClick={onEndAuction}
                    disabled={!!actionPending}
                  >
                    {actionPending === 'end' ? (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Finalizing...
                      </span>
                    ) : (
                      'End Auction & Finalize'
                    )}
                  </Button>
                )}
              </div>
            ) : showEndButton ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-amber-400">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Auction time has expired</span>
                </div>
                <Button
                  className="w-full h-14 gradient-gold text-primary-foreground font-semibold text-lg"
                  onClick={onEndAuction}
                  disabled={!!actionPending}
                >
                  {actionPending === 'end' ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Finalizing...
                    </span>
                  ) : (
                    'Finalize Auction'
                  )}
                </Button>
              </div>
            ) : remainingTime === 0 ? (
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-amber-400">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Auction time has expired</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Waiting for seller or winner to finalize
                </p>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Your Bid Amount</p>
                  <p className="text-2xl font-bold text-foreground">{nextBidAmount} QIE</p>
                  <p className="text-xs text-muted-foreground mt-1">Current bid + 0.1 QIE</p>
                </div>

                {remainingTime <= 5 && remainingTime > 0 && (
                  <div className="flex items-center justify-center gap-2 text-amber-400 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Too close to deadline to bid safely</span>
                  </div>
                )}

                <Button
                  className="w-full h-14 gradient-gold text-primary-foreground font-semibold text-lg glow-gold"
                  onClick={onPlaceBid}
                  disabled={!canBid || !!actionPending}
                >
                  {actionPending === 'bid' ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Placing Bid...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Place Bid
                    </span>
                  )}
                </Button>
              </>
            )}
          </Card>
        </div>
      </div>
    </motion.div>
  );
};
