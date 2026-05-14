// VaultAuction ABI - human-readable format for ethers.js
const vaultAuctionAbi = [
  // Events
  "event BidPlaced(uint256 indexed vaultId, address bidder, uint256 amount)",
  "event AuctionStarted(uint256 indexed vaultId, uint256 startTime, uint256 endTime)",
  "event AuctionEnded(uint256 indexed vaultId, address winner, uint256 finalPrice)",
  "event AuctionCancelled(uint256 indexed vaultId)",
  "event AuctionCreated(uint256 indexed vaultId, uint256 startPrice)",

  // Read functions
  "function getAuction(uint256 vaultId) view returns (tuple(address seller, uint256 currentBid, address highestBidder, uint256 startTime, uint256 lastBidTime, uint256 bidWindow, uint256 auctionDuration, uint256 endTime, bool active, bool ended, uint256 startPrice))",
  "function getAuctionTiming(uint256 vaultId) view returns (uint256 lastBidTime, uint256 bidWindow, uint256 endTime, bool active, bool ended)",
  "function getAuctionCard(uint256 vaultId) view returns (string name, string description, bool isLive, bool isEnded, uint256 timeRemaining, uint256 minimumPrice)",
  "function getAllAuctions() view returns (uint256[])",
  "function vaultCount() view returns (uint256)",
];

export default vaultAuctionAbi;
