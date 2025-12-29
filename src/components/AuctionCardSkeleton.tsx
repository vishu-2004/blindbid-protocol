import { motion } from 'framer-motion';

interface AuctionCardSkeletonProps {
  index: number;
}

export const AuctionCardSkeleton = ({ index }: AuctionCardSkeletonProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="rounded-xl p-6 bg-card/80 border border-border/50"
    >
      {/* Image skeleton */}
      <div className="w-full aspect-[4/3] rounded-lg bg-dark-700 mb-4 animate-pulse" />

      {/* Title skeleton */}
      <div className="h-6 bg-dark-700 rounded-md w-3/4 mb-2 animate-pulse" />

      {/* Description skeleton */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-dark-700 rounded-md w-full animate-pulse" />
        <div className="h-4 bg-dark-700 rounded-md w-2/3 animate-pulse" />
      </div>

      {/* Stats skeleton */}
      <div className="space-y-3 pt-3 border-t border-border/50">
        <div className="flex justify-between items-center">
          <div className="h-4 bg-dark-700 rounded-md w-20 animate-pulse" />
          <div className="h-4 bg-dark-700 rounded-md w-16 animate-pulse" />
        </div>
        <div className="flex justify-between items-center">
          <div className="h-4 bg-dark-700 rounded-md w-16 animate-pulse" />
          <div className="h-4 bg-dark-700 rounded-md w-20 animate-pulse" />
        </div>
      </div>
    </motion.div>
  );
};
