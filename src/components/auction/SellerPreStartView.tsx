import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Play, X, Trash2, Clock, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { AddressDisplay } from './AddressDisplay';
import { NFTCard } from './NFTCard';
import { type VaultData } from '@/hooks/useAuctionDetail';
import { formatEther } from 'viem';

interface SellerPreStartViewProps {
  vaultData: VaultData;
  vaultId: string;
  formattedStartPrice: string;
  actionPending: string | null;
  onStartAuction: () => void;
  onCancelAuction: () => void;
  onCancelVault: () => void;
}

export const SellerPreStartView = ({
  vaultData,
  vaultId,
  formattedStartPrice,
  actionPending,
  onStartAuction,
  onCancelAuction,
  onCancelVault,
}: SellerPreStartViewProps) => {
  const [copied, setCopied] = useState(false);

  const auctionLink = `${window.location.origin}/auction/${vaultId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(auctionLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
          className="w-20 h-20 mx-auto mb-4 rounded-full gradient-gold flex items-center justify-center"
        >
          <Clock className="w-10 h-10 text-primary-foreground" />
        </motion.div>
        <h1 className="text-3xl font-bold text-foreground mb-2">{vaultData.name}</h1>
        <p className="text-muted-foreground max-w-md mx-auto">{vaultData.description}</p>
      </div>

      {/* Vault Info Card */}
      <Card className="glass-gold p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-border/30 pb-4">
          <span className="text-muted-foreground">Seller</span>
          <AddressDisplay address={vaultData.seller} label="Verified Seller" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="glass rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Coins className="w-4 h-4" />
              <span className="text-sm">Start Price</span>
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

        {/* NFT List */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Vault Contents</h3>
          <div className="grid gap-2 max-h-48 overflow-y-auto">
            {vaultData.nfts.map((nft, index) => (
              <NFTCard
                key={index}
                nftAddress={nft.nftAddress}
                tokenId={nft.tokenId}
                showFullAddress
              />
            ))}
          </div>
        </div>
      </Card>

      {/* Shareable Link */}
      <Card className="glass p-4">
        <p className="text-sm text-muted-foreground mb-3">Share this auction link with potential buyers:</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-input rounded-lg p-3 font-mono text-sm text-foreground truncate">
            {auctionLink}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopyLink}
            className="shrink-0"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          className="flex-1 h-14 gradient-gold text-primary-foreground font-semibold text-lg"
          onClick={onStartAuction}
          disabled={!!actionPending}
        >
          {actionPending === 'start' ? (
            <span className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Starting...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              Start Auction
            </span>
          )}
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="flex-1 h-14 border-destructive/50 text-destructive hover:bg-destructive/10"
              disabled={!!actionPending}
            >
              <X className="w-5 h-5 mr-2" />
              Cancel Auction
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Auction?</AlertDialogTitle>
              <AlertDialogDescription>
                This will cancel the auction configuration. The vault and NFTs will remain intact.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep Auction</AlertDialogCancel>
              <AlertDialogAction
                onClick={onCancelAuction}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {actionPending === 'cancelAuction' ? 'Cancelling...' : 'Cancel Auction'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              className="h-14 text-destructive hover:bg-destructive/10"
              disabled={!!actionPending}
            >
              <Trash2 className="w-5 h-5 mr-2" />
              Cancel Vault
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Vault?</AlertDialogTitle>
              <AlertDialogDescription>
                This will cancel the vault and return all NFTs to your wallet. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep Vault</AlertDialogCancel>
              <AlertDialogAction
                onClick={onCancelVault}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {actionPending === 'cancelVault' ? 'Cancelling...' : 'Cancel Vault'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </motion.div>
  );
};
