import { useMemo } from 'react';
import { type Address } from 'viem';

interface AddressDisplayProps {
  address: Address;
  showAvatar?: boolean;
  label?: string;
  className?: string;
}

// Generate a deterministic color from address (like blockies)
const generateBlockieColors = (address: string) => {
  const seed = address.toLowerCase();
  const hash = seed.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  const h = Math.abs(hash) % 360;
  return {
    primary: `hsl(${h}, 70%, 50%)`,
    secondary: `hsl(${(h + 40) % 360}, 60%, 40%)`,
    tertiary: `hsl(${(h + 80) % 360}, 50%, 30%)`,
  };
};

export const AddressDisplay = ({ 
  address, 
  showAvatar = true, 
  label,
  className = '' 
}: AddressDisplayProps) => {
  const shortAddress = useMemo(() => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, [address]);

  const colors = useMemo(() => generateBlockieColors(address), [address]);

  const isZeroAddress = address === '0x0000000000000000000000000000000000000000';

  if (isZeroAddress) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {label && <span className="text-muted-foreground text-sm">{label}</span>}
        <span className="text-muted-foreground">No bids yet</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showAvatar && (
        <div 
          className="w-8 h-8 rounded-full overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary}, ${colors.tertiary})`,
          }}
        >
          {/* Simple blockie-style pattern */}
          <svg viewBox="0 0 8 8" className="w-full h-full">
            <rect x="1" y="1" width="2" height="2" fill={colors.secondary} opacity="0.8" />
            <rect x="5" y="1" width="2" height="2" fill={colors.secondary} opacity="0.8" />
            <rect x="2" y="3" width="4" height="2" fill={colors.tertiary} opacity="0.6" />
            <rect x="1" y="5" width="2" height="2" fill={colors.secondary} opacity="0.8" />
            <rect x="5" y="5" width="2" height="2" fill={colors.secondary} opacity="0.8" />
          </svg>
        </div>
      )}
      <div className="flex flex-col">
        {label && <span className="text-xs text-muted-foreground">{label}</span>}
        <span className="font-mono text-sm text-foreground">{shortAddress}</span>
      </div>
    </div>
  );
};
