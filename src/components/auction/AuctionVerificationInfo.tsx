import { motion } from 'framer-motion';
import { AlertTriangle, Crown, Gem, Sparkles, TrendingUp } from 'lucide-react';

interface RarityBreakdown {
  legendary: number;
  rare: number;
  common: number;
}

interface EstimatedValueBand {
  label: string;
  displayRange: string;
  confidence: string;
}

interface RiskFlags {
  freshMintDetected: boolean;
}

interface AuctionVerificationInfoProps {
  estimatedValueBand: EstimatedValueBand;
  rarityBreakdown: RarityBreakdown;
  riskFlags: RiskFlags;
  compact?: boolean;
}

export const AuctionVerificationInfo = ({
  estimatedValueBand,
  rarityBreakdown,
  riskFlags,
  compact = false,
}: AuctionVerificationInfoProps) => {
  const getValueBandColor = (label: string) => {
    switch (label.toLowerCase()) {
      case 'high':
        return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';
      case 'medium':
        return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
      case 'low':
        return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
      default:
        return 'text-muted-foreground bg-muted/10 border-border';
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence.toLowerCase()) {
      case 'high':
        return 'text-emerald-400';
      case 'medium':
        return 'text-amber-400';
      case 'low':
        return 'text-orange-400';
      default:
        return 'text-muted-foreground';
    }
  };

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        {/* Value Band - Compact */}
        <div className={`rounded-lg p-3 border ${getValueBandColor(estimatedValueBand.label)}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Est. Value</span>
            </div>
            <span className="text-sm font-semibold">{estimatedValueBand.displayRange}</span>
          </div>
        </div>

        {/* Rarity - Compact */}
        <div className="flex items-center gap-3 text-sm">
          {rarityBreakdown.legendary > 0 && (
            <span className="flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-400 font-medium">{rarityBreakdown.legendary}</span>
            </span>
          )}
          {rarityBreakdown.rare > 0 && (
            <span className="flex items-center gap-1">
              <Gem className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-purple-400 font-medium">{rarityBreakdown.rare}</span>
            </span>
          )}
          {rarityBreakdown.common > 0 && (
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-muted-foreground font-medium">{rarityBreakdown.common}</span>
            </span>
          )}
        </div>

        {/* Risk Flag - Compact */}
        {riskFlags.freshMintDetected && (
          <div className="flex items-center gap-1.5 text-orange-400 text-xs">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Fresh mint</span>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Estimated Value Band */}
      <div className={`rounded-lg p-4 border ${getValueBandColor(estimatedValueBand.label)}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm font-medium">Estimated Value</span>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full border ${getValueBandColor(estimatedValueBand.label)}`}>
            {estimatedValueBand.label}
          </span>
        </div>
        <p className="text-xl font-semibold">{estimatedValueBand.displayRange}</p>
        <p className={`text-xs mt-1 ${getConfidenceColor(estimatedValueBand.confidence)}`}>
          Confidence: {estimatedValueBand.confidence}
        </p>
      </div>

      {/* Rarity Breakdown */}
      <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
        <p className="text-sm font-medium text-foreground mb-3">Rarity Breakdown</p>
        <div className="flex flex-wrap items-center gap-4">
          {rarityBreakdown.legendary > 0 && (
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-foreground">
                <span className="font-semibold text-amber-400">{rarityBreakdown.legendary}</span> Legendary
              </span>
            </div>
          )}
          {rarityBreakdown.rare > 0 && (
            <div className="flex items-center gap-2">
              <Gem className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-foreground">
                <span className="font-semibold text-purple-400">{rarityBreakdown.rare}</span> Rare
              </span>
            </div>
          )}
          {rarityBreakdown.common > 0 && (
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-foreground">
                <span className="font-semibold">{rarityBreakdown.common}</span> Common
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Risk Flags */}
      {riskFlags.freshMintDetected && (
        <div className="bg-orange-500/10 rounded-lg p-3 border border-orange-500/30 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />
          <p className="text-sm text-orange-500">
            Fresh mint detected — valuation may be uncertain
          </p>
        </div>
      )}
    </motion.div>
  );
};

// Helper to generate mock verification data based on NFT count
// In production, this would come from the backend/stored data
export const generateVerificationData = (nftCount: number) => {
  const legendary = Math.floor(nftCount * 0.1);
  const rare = Math.floor(nftCount * 0.3);
  const common = nftCount - legendary - rare;

  const baseValue = nftCount * 0.3;
  const hasFreshMint = Math.random() > 0.7;

  return {
    estimatedValueBand: {
      label: baseValue >= 0.7 ? 'High' : baseValue >= 0.2 ? 'Medium' : 'Low',
      displayRange: `${(baseValue * 1.5).toFixed(2)} – ${(baseValue * 4).toFixed(2)} QIE`,
      confidence: hasFreshMint ? 'Low' : 'Medium',
    },
    rarityBreakdown: {
      legendary,
      rare,
      common,
    },
    riskFlags: {
      freshMintDetected: hasFreshMint,
    },
  };
};
