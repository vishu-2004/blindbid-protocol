import { motion } from 'framer-motion';
import { Trophy, ExternalLink, Coins, CheckCircle, PartyPopper } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { AddressDisplay } from './AddressDisplay';
import { type VaultData } from '@/hooks/useAuctionDetail';

interface AuctionEndedViewProps {
  vaultData: VaultData;
  formattedCurrentBid: string;
  isWinner: boolean;
}

export const AuctionEndedView = ({
  vaultData,
  formattedCurrentBid,
  isWinner,
}: AuctionEndedViewProps) => {
  const hasWinner = vaultData.highestBidder !== '0x0000000000000000000000000000000000000000';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Winner Banner */}
      {isWinner && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 glow-gold">
            <PartyPopper className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">Congratulations! You Won!</span>
            <Trophy className="w-8 h-8 text-primary" />
          </div>
        </motion.div>
      )}

      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
          className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
            hasWinner ? 'gradient-gold' : 'bg-muted/50'
          }`}
        >
          {hasWinner ? (
            <Trophy className="w-12 h-12 text-primary-foreground" />
          ) : (
            <CheckCircle className="w-12 h-12 text-muted-foreground" />
          )}
        </motion.div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted/50 border border-border mb-4">
          <CheckCircle className="w-4 h-4 text-green-400" />
          <span className="text-foreground text-sm font-medium">Auction Ended</span>
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-2">{vaultData.name}</h1>
        <p className="text-muted-foreground max-w-md mx-auto">{vaultData.description}</p>
      </div>

      {/* Receipt Card */}
      <Card className="glass-gold p-6 space-y-6 max-w-2xl mx-auto">
        <div className="text-center pb-4 border-b border-border/30">
          <h2 className="text-xl font-semibold text-foreground">Auction Receipt</h2>
        </div>

        {/* Final Price */}
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground mb-2">Final Sale Price</p>
          <p className="text-4xl font-bold text-primary">
            {hasWinner ? formattedCurrentBid : '0'} QIE
          </p>
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border/20">
            <span className="text-muted-foreground">Seller</span>
            <AddressDisplay address={vaultData.seller} />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-border/20">
            <span className="text-muted-foreground">Winner</span>
            {hasWinner ? (
              <AddressDisplay address={vaultData.highestBidder} />
            ) : (
              <span className="text-muted-foreground">No bids received</span>
            )}
          </div>

          <div className="flex items-center justify-between py-3 border-b border-border/20">
            <span className="text-muted-foreground">NFTs Transferred</span>
            <span className="text-foreground font-semibold">{vaultData.nfts.length}</span>
          </div>
        </div>

        {/* Revealed NFTs (visible to winner or if auction ended without bids) */}
        {(isWinner || !hasWinner) && vaultData.nfts.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              {isWinner ? 'Your NFTs' : 'Vault Contents (Returned to Seller)'}
            </h3>
            <div className="grid gap-2 max-h-64 overflow-y-auto">
              {vaultData.nfts.map((nft, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass rounded-lg p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">#{Number(nft.tokenId)}</span>
                    </div>
                    <div>
                      <p className="font-mono text-xs text-muted-foreground">
                        {nft.nftAddress.slice(0, 10)}...{nft.nftAddress.slice(-6)}
                      </p>
                      <p className="text-sm font-medium text-foreground">Token #{Number(nft.tokenId)}</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
};
