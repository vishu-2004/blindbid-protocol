import { motion } from 'framer-motion';
import { RefreshCw, Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuctionCard } from '@/components/AuctionCard';
import { AuctionCardSkeleton } from '@/components/AuctionCardSkeleton';
import { useAuctions } from '@/hooks/useAuctions';
import { isContractConfigured } from '@/utils/contract';

const Auctions = () => {
  const { auctions, liveAuctions, endedAuctions, isLoading, error, refetch } = useAuctions();
  const contractConfigured = isContractConfigured();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="container mx-auto px-4 pt-8 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
              All Auctions
            </h1>
            <p className="text-muted-foreground max-w-lg">
              Discover blind vault auctions. Bid on sealed NFT collections without seeing the assets inside.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            className="self-start md:self-auto border-primary/30 text-primary hover:bg-primary/10"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </motion.div>
      </section>

      {/* Stats Bar */}
      <section className="container mx-auto px-4 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex gap-6 text-sm"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-muted-foreground">
              <span className="font-medium text-foreground">{liveAuctions.length}</span> Live
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-muted-foreground" />
            <span className="text-muted-foreground">
              <span className="font-medium text-foreground">{endedAuctions.length}</span> Ended
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">
              <span className="font-medium text-foreground">{auctions.length}</span> Total
            </span>
          </div>
        </motion.div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 pb-20">
        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Failed to Load Auctions
            </h3>
            <p className="text-muted-foreground max-w-md mb-6">
              {error}
            </p>
            <Button onClick={() => refetch()} variant="outline" className="border-primary/30 text-primary">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </motion.div>
        )}

        {/* Not Configured State */}
        {!contractConfigured && !error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Contract Not Configured
            </h3>
            <p className="text-muted-foreground max-w-md">
              The VaultAuction contract address is not set. Please configure your environment variables.
            </p>
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && contractConfigured && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <AuctionCardSkeleton key={i} index={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && contractConfigured && auctions.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <motion.div
              className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Lock className="w-10 h-10 text-primary" />
            </motion.div>
            <h3 className="text-2xl font-semibold text-foreground mb-2">
              No Auctions Yet
            </h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Be the first to create a blind vault auction. Bundle your NFTs and let buyers discover hidden treasures.
            </p>
            <Button asChild className="gradient-gold text-primary-foreground font-semibold">
              <a href="/create">Create First Vault</a>
            </Button>
          </motion.div>
        )}

        {/* Auction Grid */}
        {!isLoading && !error && auctions.length > 0 && (
          <div className="space-y-12">
            {/* Live Auctions */}
            {liveAuctions.length > 0 && (
              <div>
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Live Auctions
                </motion.h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {liveAuctions.map((auction, index) => (
                    <AuctionCard key={auction.vaultId} auction={auction} index={index} />
                  ))}
                </div>
              </div>
            )}

            {/* Ended Auctions */}
            {endedAuctions.length > 0 && (
              <div>
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                  Ended Auctions
                </motion.h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {endedAuctions.map((auction, index) => (
                    <AuctionCard key={auction.vaultId} auction={auction} index={index} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default Auctions;
