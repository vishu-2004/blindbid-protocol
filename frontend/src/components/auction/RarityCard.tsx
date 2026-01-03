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
    gradient: 'from-slate-300 via-slate-400 to-slate-500',
    bgGradient: 'from-slate-700/60 via-slate-800/80 to-slate-900/90',
    glow: 'hsl(220 10% 50% / 0.4)',
    glowIntense: 'hsl(220 10% 60% / 0.6)',
    textColor: 'text-slate-200',
    borderColor: 'border-slate-400/30',
  },
  rare: {
    label: 'Rare',
    icon: Sparkles,
    gradient: 'from-blue-300 via-purple-400 to-indigo-500',
    bgGradient: 'from-blue-800/60 via-purple-900/80 to-indigo-900/90',
    glow: 'hsl(250 70% 50% / 0.5)',
    glowIntense: 'hsl(250 80% 60% / 0.7)',
    textColor: 'text-blue-200',
    borderColor: 'border-purple-400/40',
  },
  legendary: {
    label: 'Legendary',
    icon: Crown,
    gradient: 'from-amber-300 via-yellow-400 to-orange-500',
    bgGradient: 'from-amber-800/60 via-yellow-900/80 to-orange-900/90',
    glow: 'hsl(43 90% 50% / 0.5)',
    glowIntense: 'hsl(43 100% 60% / 0.8)',
    textColor: 'text-amber-200',
    borderColor: 'border-amber-400/50',
  },
};

export const RarityCard = ({ rarity, count, index }: RarityCardProps) => {
  const config = rarityConfig[rarity];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.8, rotateX: -15 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
      transition={{ 
        delay: index * 0.15, 
        duration: 0.6,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ 
        scale: 1.08, 
        y: -8,
        rotateY: 5,
        transition: { duration: 0.3 }
      }}
      className="relative group perspective-1000"
    >
      {/* Outer glow */}
      <div 
        className="absolute -inset-2 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
        style={{ background: `radial-gradient(ellipse at center, ${config.glowIntense}, transparent 70%)` }}
      />
      
      {/* Card container */}
      <div
        className={`
          relative overflow-hidden rounded-xl p-6
          bg-gradient-to-br ${config.bgGradient}
          border ${config.borderColor}
          backdrop-blur-sm
          cursor-default
          transform-gpu
        `}
        style={{
          boxShadow: `
            0 0 20px ${config.glow},
            0 0 40px ${config.glow},
            inset 0 1px 0 rgba(255,255,255,0.1)
          `
        }}
      >
        {/* Animated shine sweep */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100"
          style={{
            background: 'linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.15) 45%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.15) 55%, transparent 80%)',
            animation: 'shineSweep 1.5s ease-in-out infinite',
          }}
        />
        
        {/* Continuous shimmer */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08) 50%, transparent)',
            animation: 'shimmerMove 3s ease-in-out infinite',
          }}
        />
        
        {/* Sparkle particles for legendary */}
        {rarity === 'legendary' && (
          <>
            <motion.div
              className="absolute top-4 right-6 w-1 h-1 bg-amber-300 rounded-full"
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{ duration: 2, repeat: Infinity, delay: 0 }}
            />
            <motion.div
              className="absolute top-8 right-10 w-1.5 h-1.5 bg-yellow-200 rounded-full"
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0, 1.2, 0],
              }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            />
            <motion.div
              className="absolute bottom-8 left-8 w-1 h-1 bg-orange-300 rounded-full"
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0, 1.3, 0],
              }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            />
          </>
        )}
        
        {/* Icon with glow */}
        <div className="relative">
          <div 
            className={`w-14 h-14 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center mb-4 shadow-lg`}
            style={{
              boxShadow: `0 0 20px ${config.glow}, 0 4px 15px rgba(0,0,0,0.3)`
            }}
          >
            <Icon className="w-7 h-7 text-white drop-shadow-lg" />
          </div>
        </div>

        {/* Label with gradient text */}
        <h3 className={`text-xl font-bold ${config.textColor} mb-2 tracking-wide`}>
          {config.label}
        </h3>

        {/* Count with emphasis */}
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-foreground drop-shadow-sm">
            {count}
          </span>
          <span className="text-sm text-muted-foreground font-medium">NFTs</span>
        </div>

        {/* Decorative elements */}
        <div 
          className={`absolute -top-10 -right-10 w-28 h-28 rounded-full bg-gradient-to-br ${config.gradient} opacity-15 blur-sm`}
        />
        <div 
          className={`absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-gradient-to-br ${config.gradient} opacity-10 blur-md`}
        />
      </div>
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
