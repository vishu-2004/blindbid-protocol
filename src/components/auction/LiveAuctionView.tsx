import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Shield, Zap, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CountdownTimer } from './CountdownTimer';
import { RarityCard, generateRarityDistribution } from './RarityCard';
import { AddressDisplay } from './AddressDisplay';
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
  activeChain,
  onPlaceBid,
  onEndAuction,
}: LiveAuctionViewProps) => {
  const rarityDistribution = useMemo(() => {
    return generateRarityDistribution(vaultData.nfts.length);
  }, [vaultData.nfts.length]);

  const showEndButton = remainingTime === 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header with pulse effect for live */}
      <div className="text-center relative">
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/20 border border-green-500/30">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-green-400 text-sm font-medium">LIVE</span>
          </span>
        </motion.div>

        <h1 className="text-3xl font-bold text-foreground mt-8 mb-2">{vaultData.name}</h1>
        <p className="text-muted-foreground max-w-md mx-auto">{vaultData.description}</p>
        
        <div className="mt-4">
          <AddressDisplay address={vaultData.seller} label="Verified Seller" className="justify-center" />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Vault Preview */}
        <div className="space-y-6">
          {/* Rarity Cards */}
          <Card className="glass-gold p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Hidden Vault Contents
            </h3>
            
            {/* Estimated Value */}
            <div className="text-center mb-6 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
              <p className="text-sm text-muted-foreground mb-1">Estimated Vault Value</p>
              <p className="text-3xl font-bold text-gradient-gold">~{(Number(formattedCurrentBid) * 1.5).toFixed(0)} QIE</p>
              <p className="text-xs text-muted-foreground mt-1">*Placeholder estimate</p>
            </div>

            {/* Rarity Grid */}
            <div className="grid grid-cols-3 gap-3">
              {rarityDistribution.common > 0 && (
                <RarityCard rarity="common" count={rarityDistribution.common} index={0} />
              )}
              {rarityDistribution.rare > 0 && (
                <RarityCard rarity="rare" count={rarityDistribution.rare} index={1} />
              )}
              {rarityDistribution.legendary > 0 && (
                <RarityCard rarity="legendary" count={rarityDistribution.legendary} index={2} />
              )}
            </div>

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
            ) : (
              <>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Your Bid Amount</p>
                  <p className="text-2xl font-bold text-foreground">{nextBidAmount} QIE</p>
                  <p className="text-xs text-muted-foreground mt-1">Current bid + 1 QIE</p>
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
