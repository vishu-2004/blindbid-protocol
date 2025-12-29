import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Landing = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section Placeholder */}
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          <span className="text-foreground">Blind Auctions for </span>
          <span className="text-gradient-gold">NFT Vaults</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Bid confidently on hidden treasures. A premium blind auction protocol 
          where smart contracts ensure fairness and transparency.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="gradient-gold text-primary-foreground font-semibold">
            Explore Auctions
          </Button>
          <Link to="/create">
            <Button size="lg" variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
              Create Vault
            </Button>
          </Link>
        </div>
      </div>

      {/* Placeholder for future content */}
      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-gold rounded-xl p-6 text-center">
            <div className="w-12 h-12 rounded-lg gradient-gold mx-auto mb-4 flex items-center justify-center">
              <span className="text-primary-foreground font-bold">{i}</span>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Feature {i}
            </h3>
            <p className="text-sm text-muted-foreground">
              Placeholder for feature description. Content will be added in future prompts.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Landing;
