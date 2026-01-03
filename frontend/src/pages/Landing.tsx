import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Shield, Eye, Zap, Lock } from 'lucide-react';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const floatVariants = {
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

const features = [
  {
    icon: Lock,
    title: 'Vault-Based Auctions',
    description: 'Sellers bundle NFTs into sealed vaults. Buyers bid on the entire collection without seeing individual assets.',
  },
  {
    icon: Eye,
    title: 'Blind Bidding',
    description: 'Asset details remain hidden during bidding. Contents are revealed only after the auction concludes.',
  },
  {
    icon: Zap,
    title: 'Real-Time Price Discovery',
    description: 'Rapid bidding mechanics enable fair market valuation through competitive, time-boxed auctions.',
  },
  {
    icon: Shield,
    title: 'Fully On-Chain',
    description: 'Smart contracts enforce all logic. No backend, no intermediaries — just trustless, verifiable execution.',
  },
];

const Landing = () => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900" />
        
        {/* Animated gradient orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, hsl(43 74% 49% / 0.3) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, hsl(43 74% 40% / 0.4) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
          animate={{
            x: [0, -40, 0],
            y: [0, -50, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        {/* Grid overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(hsl(43 74% 49%) 1px, transparent 1px),
                              linear-gradient(90deg, hsl(43 74% 49%) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto text-center"
        >
          {/* Protocol Badge */}
          <motion.div variants={itemVariants}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20 mb-8">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Decentralized Auction Protocol
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1 
            variants={itemVariants}
            className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
          >
            <span className="text-foreground">A Blind Vault Auction</span>
            <br />
            <span className="bg-gradient-to-r from-gold-300 via-primary to-gold-400 bg-clip-text text-transparent">Protocol for NFTs</span>
          </motion.h1>

          {/* Protocol Description */}
          <motion.p 
            variants={itemVariants}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            BlindBid is a fully on-chain auction protocol where sellers bundle NFTs 
            into sealed vaults and buyers bid without knowing the exact assets inside. 
            Smart contracts enforce all auction logic enabling trustless price discovery 
            with no backend or intermediaries.
          </motion.p>

        </motion.div>

        
        {/* <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12"
        >
          
          <Link to="/create">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                size="lg" 
                className="h-14 px-8 text-lg font-semibold gradient-gold text-primary-foreground shadow-lg hover:shadow-primary/25 transition-shadow"
              >
                <Lock className="w-5 h-5 mr-2" />
                Create Vault
              </Button>
            </motion.div>
          </Link>

          
          <Link to="/auctions">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                size="lg" 
                variant="outline"
                className="h-14 px-8 text-lg font-semibold border-primary/50 text-primary hover:bg-primary/10 hover:border-primary transition-all"
              >
                <Eye className="w-5 h-5 mr-2" />
                Browse Auctions
              </Button>
            </motion.div>
          </Link>
        </motion.div> */}

        {/* User Path Labels */}
        {/* <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="flex justify-center gap-8 text-sm text-muted-foreground mt-6"
        >
          <span>For NFT Sellers</span>
          <span className="text-border">|</span>
          <span>For Bidders</span>
        </motion.div> */}
      </section>

      {/* Floating Vault Icon */}
      <motion.div
        variants={floatVariants}
        animate="animate"
        className="absolute top-1/3 right-[10%] hidden lg:block"
      >
        <div className="w-20 h-20 rounded-2xl glass-gold flex items-center justify-center rotate-12 glow-gold-subtle">
          <Lock className="w-8 h-8 text-primary" />
        </div>
      </motion.div>

      <motion.div
        variants={floatVariants}
        animate="animate"
        className="absolute top-1/2 left-[8%] hidden lg:block"
        style={{ animationDelay: '2s' }}
      >
        <div className="w-16 h-16 rounded-xl glass-gold flex items-center justify-center -rotate-6 opacity-70">
          <Eye className="w-6 h-6 text-primary" />
        </div>
      </motion.div>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How the Protocol Works
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            A trustless auction mechanism designed for fair, transparent NFT trading
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="h-full glass rounded-xl p-6 border border-border/50 hover:border-primary/30 transition-colors group"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Protocol Stats / Trust Indicators */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-gold rounded-2xl p-8 md:p-12"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl md:text-4xl font-bold text-primary mb-1">100%</p>
              <p className="text-sm text-muted-foreground">On-Chain Logic</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-foreground mb-1">0</p>
              <p className="text-sm text-muted-foreground">Backend Dependencies</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-foreground mb-1">Blind</p>
              <p className="text-sm text-muted-foreground">Auction Mechanics</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-foreground mb-1">Trustless</p>
              <p className="text-sm text-muted-foreground">Price Discovery</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Final CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Ready to Participate?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Join the decentralized auction protocol. Create a vault or start bidding today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/create">
              <Button className="gradient-gold text-primary-foreground font-semibold px-6">
                Create a Vault
              </Button>
            </Link>
            <Link to="/auctions">
              <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/10 px-6">
                Explore Auctions
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Landing;
