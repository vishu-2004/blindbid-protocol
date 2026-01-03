import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AuctionNotFoundViewProps {
  error?: string | null;
}

export const AuctionNotFoundView = ({ error }: AuctionNotFoundViewProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-destructive/20 flex items-center justify-center">
        <AlertCircle className="w-12 h-12 text-destructive" />
      </div>

      <h1 className="text-2xl font-bold text-foreground mb-2">Auction Not Found</h1>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        {error || 'The auction you\'re looking for doesn\'t exist or may have been removed.'}
      </p>

      <Button asChild>
        <Link to="/auctions">Browse All Auctions</Link>
      </Button>
    </motion.div>
  );
};
