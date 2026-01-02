export function calculateRarity(indexedNFTs) {
  const breakdown = {
    legendary: 0,
    rare: 0,
    common: 0
  };

  for (const nft of indexedNFTs) {
    const traits = nft.metadata?.attributes?.length || 0;

    if (traits >= 8) breakdown.legendary++;
    else if (traits >= 4) breakdown.rare++;
    else breakdown.common++;
  }

  return breakdown;
}
