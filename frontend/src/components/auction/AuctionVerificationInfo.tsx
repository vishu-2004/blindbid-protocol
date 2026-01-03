import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import { RarityCard } from './RarityCard';
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
  // Return null if required data is missing
  if (!estimatedValueBand || !rarityBreakdown || !riskFlags) {
    return null;
  }
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

        {/* Rarity Cards - Compact */}
        <div className="grid grid-cols-3 gap-2">
          {rarityBreakdown.common > 0 && (
            <RarityCard rarity="common" count={rarityBreakdown.common} index={0} />
          )}
          {rarityBreakdown.rare > 0 && (
            <RarityCard rarity="rare" count={rarityBreakdown.rare} index={1} />
          )}
          {rarityBreakdown.legendary > 0 && (
            <RarityCard rarity="legendary" count={rarityBreakdown.legendary} index={2} />
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

      {/* Rarity Cards */}
      <div>
        <p className="text-sm font-medium text-foreground mb-3">Rarity Breakdown</p>
        <div className="grid grid-cols-3 gap-3">
          {rarityBreakdown.common > 0 && (
            <RarityCard rarity="common" count={rarityBreakdown.common} index={0} />
          )}
          {rarityBreakdown.rare > 0 && (
            <RarityCard rarity="rare" count={rarityBreakdown.rare} index={1} />
          )}
          {rarityBreakdown.legendary > 0 && (
            <RarityCard rarity="legendary" count={rarityBreakdown.legendary} index={2} />
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
