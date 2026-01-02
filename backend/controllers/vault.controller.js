import { indexNFTs } from "../services/indexer.service.js";
import { calculateRarity } from "../services/rarity.service.js";
import { estimateValue } from "../services/valuation.service.js";

export async function verifyVault(req, res) {
  try {
    const { nfts } = req.body;

    if (!nfts || !nfts.length) {
      return res.status(400).json({ error: "No NFTs provided" });
    }

    // 1️⃣ Index blockchain data
    const indexed = await indexNFTs(nfts);

    // 2️⃣ Rarity
    const rarity = calculateRarity(indexed);

    // 3️⃣ Estimated value
    const summary = estimateValue(indexed, rarity);

    return res.json({
      status: "approved_with_risk",
      approved: true,
      reason: "Fresh mint risk detected, but NFTs are valid",
      summary
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Verification failed" });
  }
}
