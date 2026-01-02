import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, Gem, Crown, Sparkles } from 'lucide-react';
import type { VerificationResult } from '@/hooks/useCreateVault';

interface VerificationSummaryProps {
  result: VerificationResult;
}

export const VerificationSummary = ({ result }: VerificationSummaryProps) => {
  const { summary, status, reason } = result;
  const { totalNFTs, startPrice, unit, estimatedValueBand, rarityBreakdown, riskFlags } = summary;

  const getConfidenceColor = (confidence: string) => {
    switch (confidence.toLowerCase()) {
      case 'high':
        return 'text-emerald-500';
      case 'medium':
        return 'text-amber-500';
      case 'low':
        return 'text-orange-500';
      default:
        return 'text-muted-foreground';
    }
  };

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Status Banner */}
      <div className={`p-4 rounded-lg border flex items-center gap-3 ${
        status === 'approved_with_risk' 
          ? 'bg-amber-500/10 border-amber-500/30' 
          : 'bg-emerald-500/10 border-emerald-500/30'
      }`}>
        {status === 'approved_with_risk' ? (
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
        ) : (
          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
        )}
        <div>
          <p className={`text-sm font-medium ${
            status === 'approved_with_risk' ? 'text-amber-500' : 'text-emerald-500'
          }`}>
            Verification Passed
          </p>
          <p className="text-xs text-muted-foreground">{reason}</p>
        </div>
      </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total NFTs */}
        <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground mb-1">Total NFTs</p>
          <p className="text-lg font-semibold text-foreground">{totalNFTs}</p>
        </div>

        {/* Backend Start Price */}
        <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground mb-1">Max Start Price</p>
          <p className="text-lg font-semibold text-primary">
            {startPrice} <span className="text-sm font-normal uppercase">{unit}</span>
          </p>
        </div>
      </div>

      {/* Estimated Value Band */}
      <div className={`rounded-lg p-4 border ${getValueBandColor(estimatedValueBand.label)}`}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium">Estimated Value</p>
          <span className={`text-xs px-2 py-0.5 rounded-full ${getValueBandColor(estimatedValueBand.label)}`}>
            {estimatedValueBand.label}
          </span>
        </div>
        <p className="text-lg font-semibold">{estimatedValueBand.displayRange}</p>
        <p className={`text-xs mt-1 ${getConfidenceColor(estimatedValueBand.confidence)}`}>
          Confidence: {estimatedValueBand.confidence}
        </p>
      </div>

      {/* Rarity Breakdown */}
      <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
        <p className="text-sm font-medium text-foreground mb-3">Rarity Breakdown</p>
        <div className="flex items-center gap-4">
          {rarityBreakdown.legendary > 0 && (
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-foreground">
                <span className="font-semibold">{rarityBreakdown.legendary}</span> Legendary
              </span>
            </div>
          )}
          {rarityBreakdown.rare > 0 && (
            <div className="flex items-center gap-2">
              <Gem className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-foreground">
                <span className="font-semibold">{rarityBreakdown.rare}</span> Rare
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
            Fresh mint detected — reduced valuation applied
          </p>
        </div>
      )}
    </motion.div>
  );
};
