import { motion } from 'framer-motion';
import { Sparkles, Star, Crown } from 'lucide-react';

type Rarity = 'common' | 'rare' | 'legendary';

interface RarityCardProps {
  rarity: Rarity;
  count: number;
  index: number;
}

const rarityConfig = {
  common: {
    label: 'Common',
    icon: Star,
    gradient: 'from-slate-400 to-slate-600',
    bgGradient: 'from-slate-800/50 to-slate-900/50',
    glow: 'shadow-slate-500/20',
    textColor: 'text-slate-300',
  },
  rare: {
    label: 'Rare',
    icon: Sparkles,
    gradient: 'from-blue-400 to-purple-500',
    bgGradient: 'from-blue-900/50 to-purple-900/50',
    glow: 'shadow-blue-500/30',
    textColor: 'text-blue-300',
  },
  legendary: {
    label: 'Legendary',
    icon: Crown,
    gradient: 'from-amber-400 to-orange-500',
    bgGradient: 'from-amber-900/50 to-orange-900/50',
    glow: 'shadow-amber-500/40',
    textColor: 'text-amber-300',
  },
};

export const RarityCard = ({ rarity, count, index }: RarityCardProps) => {
  const config = rarityConfig[rarity];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ scale: 1.05, y: -5 }}
      className={`
        relative overflow-hidden rounded-xl p-6
        bg-gradient-to-br ${config.bgGradient}
        border border-border/30
        shadow-lg ${config.glow}
        cursor-default
      `}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />
      
      {/* Icon */}
      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>

      {/* Label */}
      <h3 className={`text-lg font-bold ${config.textColor} mb-1`}>
        {config.label}
      </h3>

      {/* Count */}
      <p className="text-2xl font-bold text-foreground">
        {count} <span className="text-sm text-muted-foreground font-normal">NFTs</span>
      </p>

      {/* Decorative corner */}
      <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${config.gradient} opacity-10`} />
    </motion.div>
  );
};

// Generate random rarity distribution for vault NFTs
export const generateRarityDistribution = (nftCount: number) => {
  if (nftCount === 0) return { common: 0, rare: 0, legendary: 0 };
  
  // Random distribution with bias toward common
  const legendary = Math.floor(Math.random() * Math.min(2, nftCount));
  const remaining1 = nftCount - legendary;
  const rare = Math.floor(Math.random() * Math.min(3, remaining1));
  const common = remaining1 - rare;
  
  return { common, rare, legendary };
};
