import { getAuctionStateREST } from "../services/auction-events.service.js";

export async function getAuctionState(req, res) {
  try {
    const { id } = req.params;

    if (!id && id !== 0) {
      return res.status(400).json({ error: "Vault ID is required" });
    }

    const state = await getAuctionStateREST(id);
    return res.json(state);
  } catch (err) {
    console.error("Failed to fetch auction state:", err);
    return res.status(500).json({ error: "Failed to fetch auction state" });
  }
}
