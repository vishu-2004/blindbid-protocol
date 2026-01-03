import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Clock, CheckCircle2 } from 'lucide-react';
import type { AuctionCardData } from '@/hooks/useAuctions';

interface AuctionCardProps {
  auction: AuctionCardData;
  index: number;
}

const formatTimeRemaining = (seconds: number): string => {
  if (seconds <= 0) return 'Ended';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
};

export const AuctionCard = ({ auction, index }: AuctionCardProps) => {
  const isLive = auction.isLive && !auction.isEnded;
  const isPending = !auction.isLive && !auction.isEnded;
  const isEnded = auction.isEnded;

  return (
    <Link to={`/auction/${auction.vaultId}`}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.08 }}
        whileHover={{ y: -6, scale: 1.02 }}
        className="group cursor-pointer"
      >
        <div
          className={`
            relative h-full rounded-xl p-6 
            bg-card/80 backdrop-blur-sm
            border transition-all duration-300
            ${isLive 
              ? 'border-primary/30 hover:border-primary/60 hover:shadow-[0_0_30px_hsl(43_74%_49%/0.15)]' 
              : 'border-border/50 hover:border-border'
            }
          `}
        >
          {/* Live Pulse Indicator */}
          {isLive && (
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />
              <span className="relative block w-3 h-3 rounded-full bg-green-500" />
            </motion.div>
          )}

          {/* Vault Icon */}
          <div className="w-full aspect-[4/3] rounded-lg bg-gradient-to-br from-dark-700 to-dark-800 mb-4 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            <motion.div
              className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20"
              whileHover={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.5 }}
            >
              <Lock className="w-8 h-8 text-primary" />
            </motion.div>

            {/* Status Badge */}
            <div
              className={`
                absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium
                flex items-center gap-1.5
                ${isLive 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : isPending
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  : 'bg-muted/50 text-muted-foreground border border-border/50'
                }
              `}
            >
              {isLive ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  Live
                </>
              ) : isPending ? (
                <>
                  <Clock className="w-3 h-3" />
                  Pending
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  Ended
                </>
              )}
            </div>
          </div>

          {/* Vault Name */}
          <h3 className="text-lg font-semibold text-foreground mb-1 truncate group-hover:text-primary transition-colors">
            {auction.name || `Vault #${auction.vaultId}`}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[40px]">
            {auction.description || 'A sealed NFT vault auction'}
          </p>

          {/* Stats */}
          <div className="space-y-3 pt-3 border-t border-border/50">
            {/* Time Remaining */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {isLive ? 'Time Left' : 'Status'}
              </span>
              <span
                className={`text-sm font-medium ${
                  isLive && auction.timeRemaining < 60
                    ? 'text-destructive animate-pulse'
                    : isLive
                    ? 'text-green-400'
                    : isPending
                    ? 'text-yellow-400'
                    : 'text-muted-foreground'
                }`}
              >
                {isLive ? formatTimeRemaining(auction.timeRemaining) : isPending ? 'Waiting to Start' : 'Auction Ended'}
              </span>
            </div>

            {/* Minimum Price */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Min Price</span>
              <span className="text-sm font-semibold text-primary">
                {auction.minimumPrice} QIE
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};
