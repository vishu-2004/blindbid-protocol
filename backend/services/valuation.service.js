export function estimateValue(indexedNFTs, rarity) {
  let estimatedMinValue = 0;
  let hasFreshMint = false;

  // -----------------------
  // 1️⃣ Base valuation
  // -----------------------
  indexedNFTs.forEach(nft => {
    let base = 0.5;

    // 🔴 CHANGE: fresh mint penalty + flag
    if (nft.transferHistory.isFreshMint) {
      base -= 0.2;
      hasFreshMint = true;
    }

    // 🔴 CHANGE: metadata penalties
    if (nft.metadataFlags.missingMetadata) base -= 0.2;
    if (nft.metadataFlags.emptyTraits) base -= 0.1;

    // 🔴 CHANGE: enforce minimum value
    estimatedMinValue += Math.max(base, 0.1);
  });

  // -----------------------
  // 2️⃣ Floor price logic
  // -----------------------
  // 🔴 CHANGE: protocol-defined floors
  const floorPrice = hasFreshMint ? 0.005 : 0.02;

  // -----------------------
  // 3️⃣ Start price logic
  // -----------------------
  // 🔴 CHANGE: risk-based multiplier
  const multiplier = hasFreshMint ? 0.05 : 0.10;

  const startPrice = Math.max(
    floorPrice,
    estimatedMinValue * multiplier
  );

  // -----------------------
  // 4️⃣ Estimated value band (for bidders)
  // -----------------------
  // 🔴 CHANGE: fuzzy range (not exact min/max)
  const bandLow = estimatedMinValue * 1.5;
  const bandHigh = estimatedMinValue * 4;

  let bandLabel = "Low";
  if (estimatedMinValue >= 0.2 && estimatedMinValue < 0.7) bandLabel = "Medium";
  if (estimatedMinValue >= 0.7) bandLabel = "High";

  // -----------------------
  // 5️⃣ Final response
  // -----------------------
  return {
    totalNFTs: indexedNFTs.length,

    // 🔴 CHANGE: backend-calculated start price
    startPrice: Number(startPrice.toFixed(4)),
    unit: "mon",

    // 🔴 CHANGE: bidder-visible estimate
    estimatedValueBand: {
      label: bandLabel,
      displayRange: `${bandLow.toFixed(2)} – ${bandHigh.toFixed(2)} MON`,
      confidence: hasFreshMint ? "Low" : "Medium"
    },

    rarityBreakdown: rarity,

    // 🔴 CHANGE: explicit risk flags
    riskFlags: {
      freshMintDetected: hasFreshMint
    }
  };
}
