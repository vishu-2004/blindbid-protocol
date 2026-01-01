import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { type Address } from 'viem';
import { usePublicClient } from 'wagmi';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface NFTMetadata {
  name?: string;
  description?: string;
  image?: string;
}

interface NFTCardProps {
  nftAddress: Address;
  tokenId: bigint;
  showFullAddress?: boolean;
}

// ERC721 tokenURI ABI
const tokenURIAbi = [
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

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
  const publicClient = usePublicClient();

  // Fetch NFT metadata when modal opens
  useEffect(() => {
    if (isOpen && !metadata && !loading) {
      fetchMetadata();
    }
  }, [isOpen]);

  const fetchMetadata = async () => {
    if (!publicClient) return;
    
    setLoading(true);
    try {
      // Call tokenURI on the NFT contract
      const tokenURI = await publicClient.readContract({
        address: nftAddress,
        abi: tokenURIAbi,
        functionName: 'tokenURI',
        args: [tokenId],
      });

      // Resolve IPFS URL and fetch metadata
      const resolvedURI = resolveIPFS(tokenURI);
      const response = await fetch(resolvedURI);
      
      if (response.ok) {
        const data = await response.json();
        setMetadata({
          name: data.name,
          description: data.description,
          image: data.image,
        });
      } else {
        setMetadata({
          name: `Token #${Number(tokenId)}`,
          description: 'Metadata unavailable',
        });
      }
    } catch (err) {
      setMetadata({
        name: `Token #${Number(tokenId)}`,
        description: 'Unable to fetch metadata',
      });
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
        className="glass-gold rounded-xl p-3 flex items-center justify-between cursor-pointer hover:bg-primary/10 transition-all duration-300 border border-primary/30"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center shrink-0 border border-primary/20">
            <span className="text-sm font-bold text-primary">#{Number(tokenId)}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className={`font-mono text-xs text-muted-foreground ${showFullAddress ? 'break-all' : 'truncate'}`}>
              {displayAddress}
            </p>
            <p className="text-sm font-medium text-foreground">Token #{Number(tokenId)}</p>
          </div>
        </div>
        <ExternalLink className="w-4 h-4 text-primary shrink-0 ml-2" />
      </motion.div>

      {/* NFT Detail Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-sm p-0 overflow-hidden rounded-2xl border-2 border-primary/50 bg-card/95 backdrop-blur-xl shadow-[0_0_30px_rgba(212,175,55,0.15)]">
          <VisuallyHidden>
            <DialogTitle>NFT Details</DialogTitle>
          </VisuallyHidden>
          
          <div className="relative">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors border border-primary/30"
            >
              <X className="w-4 h-4 text-foreground" />
            </button>

            {/* NFT Image */}
            <div className="aspect-square w-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center relative overflow-hidden rounded-t-2xl">
              {loading ? (
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
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
                  <ImageIcon className="w-12 h-12 text-primary/50" />
                  <span className="text-sm">No image available</span>
                </div>
              )}
            </div>

            {/* NFT Info - Simplified */}
            <div className="p-4 space-y-2 bg-gradient-to-b from-transparent to-primary/5">
              <h3 className="text-lg font-bold text-gradient-gold">
                {metadata?.name || `Token #${Number(tokenId)}`}
              </h3>
              {metadata?.description && (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {metadata.description}
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};