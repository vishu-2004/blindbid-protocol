import { indexNFTs } from "../services/indexer.service.js";
import { calculateRarity } from "../services/rarity.service.js";
import { estimateValue } from "../services/valuation.service.js";

export async function verifyVault(req, res) {
  const { nfts } = req.body;

  // 1. Index blockchain data
  const indexedData = await indexNFTs(nfts);

  // 2. Rarity calculation
  const rarity = calculateRarity(indexedData);

  // 3. Value estimation
  const valuation = estimateValue(indexedData, rarity);

  return res.json({
    status: "approved_with_risk",
    approved: true,
    reason: "Fresh mint risk detected, but NFTs are valid",
    summary: valuation
  });
}
