import { motion } from 'framer-motion';
import { XCircle, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { AddressDisplay } from './AddressDisplay';
import { type VaultData } from '@/hooks/useAuctionDetail';

interface AuctionCancelledViewProps {
  vaultData: VaultData;
  vaultCancelled?: boolean;
}

export const AuctionCancelledView = ({
  vaultData,
  vaultCancelled = false,
}: AuctionCancelledViewProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 mx-auto mb-6 rounded-full bg-destructive/20 flex items-center justify-center"
        >
          <XCircle className="w-12 h-12 text-destructive" />
        </motion.div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-destructive/20 border border-destructive/30 mb-4">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          <span className="text-destructive text-sm font-medium">
            {vaultCancelled ? 'Vault Cancelled' : 'Auction Cancelled'}
          </span>
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-2">{vaultData.name}</h1>
        <p className="text-muted-foreground max-w-md mx-auto">{vaultData.description}</p>
      </div>

      {/* Info Card */}
      <Card className="glass p-6 space-y-4">
        <div className="text-center py-4">
          <p className="text-muted-foreground">
            {vaultCancelled
              ? 'This vault was cancelled by the seller. All NFTs have been returned to the seller\'s wallet.'
              : 'This auction was cancelled by the seller before it started. The vault and its contents may still exist.'}
          </p>
        </div>

        <div className="flex items-center justify-between py-3 border-t border-border/20">
          <span className="text-muted-foreground">Seller</span>
          <AddressDisplay address={vaultData.seller} />
        </div>

        {!vaultCancelled && (
          <div className="flex items-center justify-between py-3 border-t border-border/20">
            <span className="text-muted-foreground">NFTs in Vault</span>
            <span className="text-foreground font-semibold">{vaultData.nfts.length}</span>
          </div>
        )}
      </Card>

      {/* Note */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          This is a terminal state. No further actions can be taken on this {vaultCancelled ? 'vault' : 'auction'}.
        </p>
      </div>
    </motion.div>
  );
};
