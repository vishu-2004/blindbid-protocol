import { Button } from '@/components/ui/button';

const CreateVault = () => {
  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Create Vault Auction
        </h1>
        <p className="text-muted-foreground">
          Lock your NFTs in a vault and start a blind auction
        </p>
      </div>

      {/* Placeholder Form */}
      <div className="glass-gold rounded-xl p-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Vault Name
            </label>
            <div className="h-10 rounded-md bg-input border border-border" />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              NFT Address
            </label>
            <div className="h-10 rounded-md bg-input border border-border" />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Token IDs
            </label>
            <div className="h-10 rounded-md bg-input border border-border" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Minimum Bid
              </label>
              <div className="h-10 rounded-md bg-input border border-border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Duration (hours)
              </label>
              <div className="h-10 rounded-md bg-input border border-border" />
            </div>
          </div>

          <Button 
            className="w-full gradient-gold text-primary-foreground font-semibold"
            disabled
          >
            Create Vault (Coming Soon)
          </Button>
        </div>

        <p className="text-center text-muted-foreground text-sm mt-6">
          Form functionality will be implemented in future prompts.
        </p>
      </div>
    </div>
  );
};

export default CreateVault;
