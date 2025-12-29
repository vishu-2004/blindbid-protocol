const Auctions = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Active Auctions
        </h1>
        <p className="text-muted-foreground">
          Browse all live blind auctions for NFT vaults
        </p>
      </div>

      {/* Placeholder Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div 
            key={i} 
            className="glass rounded-xl p-6 border border-border/50 hover:border-primary/30 transition-colors"
          >
            {/* Placeholder card content */}
            <div className="aspect-square rounded-lg bg-dark-700 mb-4 flex items-center justify-center">
              <span className="text-muted-foreground">Vault #{i}</span>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Vault Auction #{i}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Placeholder auction details
            </p>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Current Bid</span>
              <span className="text-primary font-medium">-- QIE</span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-muted-foreground mt-12">
        Auction list will be populated from smart contract in future prompts.
      </p>
    </div>
  );
};

export default Auctions;
