import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { type Address } from 'viem';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface NFTMetadata {
  name?: string;
  description?: string;
  image?: string;
  attributes?: { trait_type: string; value: string | number }[];
}

interface NFTCardProps {
  nftAddress: Address;
  tokenId: bigint;
  showFullAddress?: boolean;
}

// Helper to convert IPFS URL to gateway URL
const resolveIPFS = (url: string) => {
  if (!url) return '';
  if (url.startsWith('ipfs://')) {
    return url.replace('ipfs://', 'https://ipfs.io/ipfs/');
  }
  return url;
};

export const NFTCard = ({ nftAddress, tokenId, showFullAddress = true }: NFTCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [metadata, setMetadata] = useState<NFTMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Fetch NFT metadata when modal opens
  useEffect(() => {
    if (isOpen && !metadata && !loading) {
      fetchMetadata();
    }
  }, [isOpen]);

  const fetchMetadata = async () => {
    setLoading(true);
    setError(false);
    try {
      // Try to fetch tokenURI from the NFT contract
      const response = await fetch(
        `https://api.qie.network/nft/${nftAddress}/${tokenId.toString()}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setMetadata(data);
      } else {
        // Fallback: generate placeholder metadata
        setMetadata({
          name: `Token #${Number(tokenId)}`,
          description: 'NFT metadata unavailable',
        });
      }
    } catch (err) {
      // Generate placeholder on error
      setMetadata({
        name: `Token #${Number(tokenId)}`,
        description: 'Unable to fetch metadata',
      });
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const displayAddress = showFullAddress 
    ? nftAddress 
    : `${nftAddress.slice(0, 10)}...${nftAddress.slice(-6)}`;

  return (
    <>
      {/* NFT Card */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.02 }}
        onClick={() => setIsOpen(true)}
        className="glass rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-primary">#{Number(tokenId)}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className={`font-mono text-xs text-muted-foreground ${showFullAddress ? 'break-all' : 'truncate'}`}>
              {displayAddress}
            </p>
            <p className="text-sm font-medium text-foreground">Token #{Number(tokenId)}</p>
          </div>
        </div>
        <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0 ml-2" />
      </motion.div>

      {/* NFT Detail Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden glass border-primary/20">
          <VisuallyHidden>
            <DialogTitle>NFT Details</DialogTitle>
          </VisuallyHidden>
          
          <div className="relative">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
            >
              <X className="w-4 h-4 text-foreground" />
            </button>

            {/* NFT Image */}
            <div className="aspect-square w-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center relative overflow-hidden">
              {loading ? (
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
              ) : metadata?.image ? (
                <img
                  src={resolveIPFS(metadata.image)}
                  alt={metadata.name || `Token #${Number(tokenId)}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <ImageIcon className="w-16 h-16" />
                  <span className="text-sm">No image available</span>
                </div>
              )}
              
              {/* Token ID Badge */}
              <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm">
                <span className="text-sm font-bold text-primary">#{Number(tokenId)}</span>
              </div>
            </div>

            {/* NFT Info */}
            <div className="p-5 space-y-4">
              {/* Name & Description */}
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  {metadata?.name || `Token #${Number(tokenId)}`}
                </h3>
                {metadata?.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {metadata.description}
                  </p>
                )}
              </div>

              {/* Contract Address */}
              <div className="glass rounded-lg p-3 space-y-1">
                <p className="text-xs text-muted-foreground">Contract Address</p>
                <p className="font-mono text-xs text-foreground break-all">
                  {nftAddress}
                </p>
              </div>

              {/* Token ID */}
              <div className="glass rounded-lg p-3 space-y-1">
                <p className="text-xs text-muted-foreground">Token ID</p>
                <p className="font-mono text-sm text-foreground">
                  {tokenId.toString()}
                </p>
              </div>

              {/* Attributes */}
              {metadata?.attributes && metadata.attributes.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">Attributes</p>
                  <div className="grid grid-cols-2 gap-2">
                    {metadata.attributes.map((attr, index) => (
                      <div
                        key={index}
                        className="glass rounded-lg p-2 text-center"
                      >
                        <p className="text-xs text-muted-foreground uppercase">
                          {attr.trait_type}
                        </p>
                        <p className="text-sm font-medium text-foreground truncate">
                          {attr.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
