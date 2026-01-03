import { motion } from 'framer-motion';
import { Clock, Coins } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { AddressDisplay } from './AddressDisplay';
import { AuctionVerificationInfo } from './AuctionVerificationInfo';
import { type VaultData, type VerificationData } from '@/hooks/useAuctionDetail';

interface BuyerPreStartViewProps {
  vaultData: VaultData;
  verificationData: VerificationData | null;
  formattedStartPrice: string;
}

export const BuyerPreStartView = ({
  vaultData,
  verificationData,
  formattedStartPrice,
}: BuyerPreStartViewProps) => {

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Clock className="w-12 h-12 text-muted-foreground" />
          </motion.div>
        </motion.div>
        
        <h1 className="text-3xl font-bold text-foreground mb-2">{vaultData.name}</h1>
        <p className="text-muted-foreground max-w-md mx-auto mb-6">{vaultData.description}</p>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-secondary/50 border border-border"
        >
          <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-foreground font-medium">Waiting for seller to start auction</span>
        </motion.div>
      </div>

      {/* Vault Preview */}
      <Card className="glass-gold p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-border/30 pb-4">
          <span className="text-muted-foreground">Seller</span>
          <AddressDisplay address={vaultData.seller} label="Verified Seller" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="glass rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Coins className="w-4 h-4" />
              <span className="text-sm">Starting Price</span>
            </div>
            <p className="text-2xl font-bold text-primary">{formattedStartPrice} QIE</p>
          </div>
          <div className="glass rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <span className="text-sm">NFTs in Vault</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{vaultData.nfts.length}</p>
          </div>
        </div>

        {/* Verification Info from Backend */}
        {verificationData ? (
          <AuctionVerificationInfo
            estimatedValueBand={verificationData.estimatedValueBand}
            rarityBreakdown={verificationData.rarityBreakdown}
            riskFlags={verificationData.riskFlags}
          />
        ) : (
          <p className="text-muted-foreground text-sm">Verification data not available</p>
        )}

        {/* Hidden contents indicator */}
        <div className="text-center py-6 border border-dashed border-border/50 rounded-lg bg-card/30">
          <div className="text-4xl mb-3">🔒</div>
          <p className="text-muted-foreground">Vault contents are hidden until auction ends</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            {vaultData.nfts.length} NFT{vaultData.nfts.length !== 1 ? 's' : ''} bundled in this vault
          </p>
        </div>
      </Card>

      {/* Info */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          This page will automatically update when the auction starts.
        </p>
      </div>
    </motion.div>
  );
};
