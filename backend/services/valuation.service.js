export function estimateValue(indexedNFTs, rarity) {
  let estimatedMinValue = 0;
  let hasFreshMint = false;

  indexedNFTs.forEach(nft => {
    let base = 0.5;

    // 🔹 CHANGE: track fresh mint
    if (nft.transferHistory.isFreshMint) {
      base -= 0.2;
      hasFreshMint = true;
    }

    if (nft.metadataFlags.missingMetadata) base -= 0.2;
    if (nft.metadataFlags.emptyTraits) base -= 0.1;

    // 🔹 CHANGE: ensure non-zero valuation
    estimatedMinValue += Math.max(base, 0.1);
  });

  // 🔹 CHANGE: protocol-defined floor price
  const floorPrice = hasFreshMint ? 0.005 : 0.02;

  // 🔹 CHANGE: risk-based multiplier
  const multiplier = hasFreshMint ? 0.05 : 0.10;

  // 🔹 CHANGE: final start price calculation
  const startPrice = Math.max(
    floorPrice,
    estimatedMinValue * multiplier
  );

  return {
    totalNFTs: indexedNFTs.length,

    // 🔹 CHANGE: only return startPrice
    startPrice: Number(startPrice.toFixed(4)),
    unit: "qie",

    rarityBreakdown: rarity,

    // 🔹 OPTIONAL: useful for UI badges / judge explanation
    riskFlags: {
      freshMintDetected: hasFreshMint
    }
  };
}
