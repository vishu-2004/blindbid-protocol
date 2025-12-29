import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const AuctionDetail = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Breadcrumb */}
      <div className="mb-8">
        <Link to="/auctions" className="text-muted-foreground hover:text-primary text-sm">
          ← Back to Auctions
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Vault Preview */}
        <div className="glass-gold rounded-xl p-6">
          <div className="aspect-square rounded-lg bg-dark-700 flex items-center justify-center mb-4">
            <div className="text-center">
              <div className="text-6xl mb-4">🔒</div>
              <span className="text-muted-foreground">Vault Contents Hidden</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Contents will be revealed after auction ends
          </p>
        </div>

        {/* Auction Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Vault Auction #{id}
            </h1>
            <p className="text-muted-foreground">
              Placeholder auction description
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Current Bid</p>
              <p className="text-2xl font-bold text-primary">-- QIE</p>
            </div>
            <div className="glass rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Time Left</p>
              <p className="text-2xl font-bold text-foreground">--:--:--</p>
            </div>
          </div>

          <div className="glass rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Bids</p>
            <p className="text-xl font-semibold text-foreground">--</p>
          </div>

          {/* Bid Form Placeholder */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Your Bid Amount
              </label>
              <div className="h-12 rounded-md bg-input border border-border" />
            </div>

            <Button 
              className="w-full h-12 gradient-gold text-primary-foreground font-semibold text-lg"
              disabled
            >
              Place Bid (Coming Soon)
            </Button>
          </div>

          <p className="text-center text-muted-foreground text-sm">
            Bidding functionality will be implemented in future prompts.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetail;
