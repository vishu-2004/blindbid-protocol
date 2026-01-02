export function estimateValue(indexedNFTs, rarity) {
  let min = 0;
  let max = 0;

  indexedNFTs.forEach(nft => {
    let base = 0.5;

    if (nft.transferHistory.isFreshMint) base -= 0.2;
    if (nft.metadataFlags.missingMetadata) base -= 0.2;
    if (nft.metadataFlags.emptyTraits) base -= 0.1;

    min += Math.max(base, 0.1);
    max += base + 0.5;
  });

  return {
    totalNFTs: indexedNFTs.length,
    combinedEstimatedValue: {
      min: Number(min.toFixed(2)),
      max: Number(max.toFixed(2)),
      unit: "qie"
    },
    rarityBreakdown: rarity
  };
}
