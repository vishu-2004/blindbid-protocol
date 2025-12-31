import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export const AuctionLoadingView = () => {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="text-center">
        <Skeleton className="w-24 h-24 rounded-full mx-auto mb-6" />
        <Skeleton className="h-8 w-64 mx-auto mb-2" />
        <Skeleton className="h-4 w-96 mx-auto" />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="glass p-6 space-y-4">
          <Skeleton className="h-6 w-48" />
          <div className="space-y-3">
            <Skeleton className="h-24 w-full rounded-lg" />
            <div className="grid grid-cols-3 gap-3">
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="glass p-6 flex justify-center">
            <Skeleton className="w-48 h-48 rounded-full" />
          </Card>
          <Card className="glass p-6">
            <Skeleton className="h-12 w-32 mx-auto mb-2" />
            <Skeleton className="h-6 w-24 mx-auto" />
          </Card>
          <Card className="glass p-6">
            <Skeleton className="h-14 w-full" />
          </Card>
        </div>
      </div>
    </div>
  );
};
