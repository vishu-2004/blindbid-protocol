// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title VaultAuction
 * @notice Blind vault-based NFT auction protocol
 */
contract VaultAuction is ReentrancyGuard {

    /* ---------- STRUCTS ---------- */

    struct NFTItem {
        address nftAddress;
        uint256 tokenId;
    }

    struct Auction {
        address seller;
        uint256 currentBid;
        address highestBidder;

        uint256 startTime;
        uint256 lastBidTime;

        uint256 bidWindow;        // 🔹 extension window (anti-sniping)
        uint256 auctionDuration;  // 🔹 TOTAL auction lifetime (NEW)
        uint256 endTime;          // 🔹 startTime + auctionDuration (NEW)

        bool active;
        bool ended;
        uint256 startPrice;
    }

    struct Vault {
        NFTItem[] nfts;
        Auction auction;
        string name;
        string description;
    }

    /* ---------- STORAGE ---------- */

    uint256 public vaultCount;
    mapping(uint256 => Vault) public vaults;
    uint256[] public auctionIds;

    /* ---------- EVENTS ---------- */

    event VaultCreated(uint256 indexed vaultId, address indexed seller);
    event AuctionCreated(uint256 indexed vaultId, uint256 startPrice);
    event AuctionStarted(uint256 indexed vaultId, uint256 startTime, uint256 endTime);
    event BidPlaced(uint256 indexed vaultId, address bidder, uint256 amount);
    event AuctionEnded(uint256 indexed vaultId, address winner, uint256 finalPrice);

    /* ---------- MODIFIERS ---------- */

    modifier onlySeller(uint256 vaultId) {
        require(msg.sender == vaults[vaultId].auction.seller, "Not vault seller");
        _;
    }

    /* ---------- VAULT ---------- */

    function createVault(
        address[] calldata nftAddresses,
        uint256[] calldata tokenIds,
        string calldata name,
        string calldata description
    ) external {
        require(nftAddresses.length == tokenIds.length, "Length mismatch");
        require(nftAddresses.length > 0, "Empty vault");

        uint256 vaultId = vaultCount;
        Vault storage v = vaults[vaultId];

        for (uint256 i = 0; i < nftAddresses.length; i++) {
            IERC721(nftAddresses[i]).transferFrom(
                msg.sender,
                address(this),
                tokenIds[i]
            );

            v.nfts.push(
                NFTItem({
                    nftAddress: nftAddresses[i],
                    tokenId: tokenIds[i]
                })
            );
        }

        v.auction.seller = msg.sender;
        v.name = name;
        v.description = description;

        vaultCount++;

        emit VaultCreated(vaultId, msg.sender);
    }

    /* ---------- AUCTION ---------- */

    // Create auction config (NO TIMER START)
    function createAuction(
        uint256 vaultId,
        uint256 startPrice,
        uint256 auctionDuration   // 🔹 NEW PARAM
    ) external onlySeller(vaultId) {
        Auction storage a = vaults[vaultId].auction;

        require(!a.active && !a.ended, "Auction exists");
        require(auctionDuration > 0, "Invalid duration");

        a.startPrice = startPrice;
        a.currentBid = startPrice;
        a.bidWindow = 30 seconds;
        a.auctionDuration = auctionDuration; // 🔹 NEW

        emit AuctionCreated(vaultId, startPrice);
    }

    // Start auction & timers
    function startAuction(uint256 vaultId) external onlySeller(vaultId) {
        Auction storage a = vaults[vaultId].auction;

        require(!a.active, "Already active");
        require(a.startPrice > 0, "Auction not created");

        a.startTime = block.timestamp;
        a.lastBidTime = block.timestamp;
        a.endTime = block.timestamp + a.auctionDuration; // 🔹 NEW
        a.active = true;
        a.ended = false;

        auctionIds.push(vaultId);

        emit AuctionStarted(vaultId, a.startTime, a.endTime);
    }

    // Bid function
    function bid(uint256 vaultId) external payable nonReentrant {
        Auction storage a = vaults[vaultId].auction;

        require(a.active && !a.ended, "Auction inactive");

        // 🔹 Check TOTAL duration
        require(block.timestamp <= a.endTime, "Auction duration ended");

        // 🔹 Check bid window
        require(
            block.timestamp <= a.lastBidTime + a.bidWindow,
            "Bid window expired"
        );

        require(msg.value == a.currentBid + 1, "Bid must be +1");

        if (a.highestBidder != address(0)) {
            payable(a.highestBidder).transfer(a.currentBid);
        }

        a.currentBid = msg.value;
        a.highestBidder = msg.sender;
        a.lastBidTime = block.timestamp;

        emit BidPlaced(vaultId, msg.sender, msg.value);
    }

    // End auction
    function endAuction(uint256 vaultId) external nonReentrant {
        Auction storage a = vaults[vaultId].auction;
        Vault storage v = vaults[vaultId];

        require(a.active && !a.ended, "Invalid state");

        // 🔹 Can end if ANY condition satisfied
        require(
            block.timestamp > a.endTime ||
            block.timestamp > a.lastBidTime + a.bidWindow,
            "Auction still running"
        );

        a.active = false;
        a.ended = true;

        if (a.highestBidder != address(0)) {
            for (uint256 i = 0; i < v.nfts.length; i++) {
                IERC721(v.nfts[i].nftAddress).transferFrom(
                    address(this),
                    a.highestBidder,
                    v.nfts[i].tokenId
                );
            }

            payable(a.seller).transfer(a.currentBid);
            emit AuctionEnded(vaultId, a.highestBidder, a.currentBid);
        } else {
            for (uint256 i = 0; i < v.nfts.length; i++) {
                IERC721(v.nfts[i].nftAddress).transferFrom(
                    address(this),
                    a.seller,
                    v.nfts[i].tokenId
                );
            }

            emit AuctionEnded(vaultId, address(0), 0);
        }
    }

    /* ---------- HELPERS / GETTERS ---------- */

    // 🔹 NEW: Check if address is seller of vault
    function isVaultSeller(uint256 vaultId, address user)
        external
        view
        returns (bool)
    {
        return vaults[vaultId].auction.seller == user;
    }

    function getAuction(uint256 vaultId)
        external
        view
        returns (Auction memory)
    {
        return vaults[vaultId].auction;
    }

    function getAuctionCard(uint256 vaultId)
        external
        view
        returns (
            string memory name,
            string memory description,
            bool isLive,
            bool isEnded,
            uint256 timeRemaining,
            uint256 minimumPrice
        )
    {
        Vault storage v = vaults[vaultId];
        Auction storage a = v.auction;

        uint256 remaining = block.timestamp >= a.endTime
            ? 0
            : (a.endTime - block.timestamp);

        return (
            v.name,
            v.description,
            a.active,
            a.ended,
            remaining,
            a.startPrice
        );
    }
}        string name;
        string description;
    }

    /* ---------- STORAGE ---------- */

    uint256 public vaultCount;
    mapping(uint256 => Vault) public vaults;
    uint256[] public auctionIds;

    /* ---------- EVENTS ---------- */

    event VaultCreated(uint256 indexed vaultId, address indexed seller);
    event AuctionCreated(uint256 indexed vaultId, uint256 startPrice);
    event AuctionStarted(uint256 indexed vaultId, uint256 startTime);
    event BidPlaced(uint256 indexed vaultId, address bidder, uint256 amount);
    event AuctionEnded(uint256 indexed vaultId, address winner, uint256 finalPrice);

    /* ---------- MODIFIERS ---------- */

    modifier onlySeller(uint256 vaultId) {
        require(msg.sender == vaults[vaultId].auction.seller, "Not vault seller");
        _;
    }

    /* ---------- VAULT ---------- */

    function createVault(
        address[] calldata nftAddresses,
        uint256[] calldata tokenIds,
        string calldata name,
        string calldata description
    ) external {
        require(nftAddresses.length == tokenIds.length, "Length mismatch");
        require(nftAddresses.length > 0, "Empty vault");

        uint256 vaultId = vaultCount;
        Vault storage v = vaults[vaultId];

        for (uint256 i = 0; i < nftAddresses.length; i++) {
            IERC721(nftAddresses[i]).transferFrom(
                msg.sender,
                address(this),
                tokenIds[i]
            );

            v.nfts.push(
                NFTItem({
                    nftAddress: nftAddresses[i],
                    tokenId: tokenIds[i]
                })
            );
        }

        v.auction.seller = msg.sender;
        v.name = name;
        v.description = description;

        vaultCount++;

        emit VaultCreated(vaultId, msg.sender);
    }

    /* ---------- AUCTION ---------- */

    // Create auction without starting timer
    function createAuction(
        uint256 vaultId,
        uint256 startPrice
    ) external onlySeller(vaultId) {
        Auction storage a = vaults[vaultId].auction;

        require(!a.active && !a.ended, "Auction already exists");

        a.startPrice = startPrice;
        a.currentBid = startPrice;
        a.bidWindow = 30 seconds;

        emit AuctionCreated(vaultId, startPrice);
    }

    // Start auction and enable bidding
    function startAuction(uint256 vaultId) external onlySeller(vaultId) {
        Auction storage a = vaults[vaultId].auction;

        require(!a.active, "Auction already active");
        require(a.startPrice > 0, "Auction not created");

        a.startTime = block.timestamp;
        a.lastBidTime = block.timestamp;
        a.active = true;
        a.ended = false;

        auctionIds.push(vaultId);

        emit AuctionStarted(vaultId, a.startTime);
    }

    // Place bid within bid window
    function bid(uint256 vaultId) external payable nonReentrant {
        Auction storage a = vaults[vaultId].auction;

        require(a.active, "Auction not active");
        require(!a.ended, "Auction ended");
        require(
            block.timestamp <= a.lastBidTime + a.bidWindow,
            "Bid window expired"
        );
        require(msg.value == a.currentBid + 1, "Bid must be +1");

        if (a.highestBidder != address(0)) {
            payable(a.highestBidder).transfer(a.currentBid);
        }

        a.currentBid = msg.value;
        a.highestBidder = msg.sender;
        a.lastBidTime = block.timestamp;

        emit BidPlaced(vaultId, msg.sender, msg.value);
    }

    // End auction after bid window expires
    function endAuction(uint256 vaultId) external nonReentrant {
        Auction storage a = vaults[vaultId].auction;
        Vault storage v = vaults[vaultId];

        require(a.active, "Auction not active");
        require(!a.ended, "Auction already ended");
        require(
            block.timestamp > a.lastBidTime + a.bidWindow,
            "Auction still running"
        );

        a.active = false;
        a.ended = true;

        if (a.highestBidder != address(0)) {
            for (uint256 i = 0; i < v.nfts.length; i++) {
                IERC721(v.nfts[i].nftAddress).transferFrom(
                    address(this),
                    a.highestBidder,
                    v.nfts[i].tokenId
                );
            }

            payable(a.seller).transfer(a.currentBid);
            emit AuctionEnded(vaultId, a.highestBidder, a.currentBid);
        } else {
            for (uint256 i = 0; i < v.nfts.length; i++) {
                IERC721(v.nfts[i].nftAddress).transferFrom(
                    address(this),
                    a.seller,
                    v.nfts[i].tokenId
                );
            }

            emit AuctionEnded(vaultId, address(0), 0);
        }
    }

    /* ---------- GETTERS ---------- */

    function getVaultNFTs(uint256 vaultId)
        external
        view
        returns (NFTItem[] memory)
    {
        return vaults[vaultId].nfts;
    }

    function getAuction(uint256 vaultId)
        external
        view
        returns (Auction memory)
    {
        return vaults[vaultId].auction;
    }

    function getAllAuctions()
        external
        view
        returns (uint256[] memory)
    {
        return auctionIds;
    }

    function getAuctionCard(uint256 vaultId)
        external
        view
        returns (
            string memory name,
            string memory description,
            bool isLive,
            bool isEnded,
            uint256 timeRemaining,
            uint256 minimumPrice
        )
    {
        Vault storage v = vaults[vaultId];
        Auction storage a = v.auction;

        uint256 remaining = block.timestamp >= a.lastBidTime + a.bidWindow
            ? 0
            : (a.lastBidTime + a.bidWindow - block.timestamp);

        return (
            v.name,
            v.description,
            a.active,
            a.ended,
            remaining,
            a.startPrice
        );
    }

    function getVaultWithAuction(uint256 vaultId)
        external
        view
        returns (
            string memory name,
            string memory description,
            NFTItem[] memory nfts,
            address seller,
            uint256 currentBid,
            address highestBidder,
            uint256 lastBidTime,
            bool active,
            bool ended,
            uint256 startPrice
        )
    {
        Vault storage v = vaults[vaultId];
        Auction storage a = v.auction;

        return (
            v.name,
            v.description,
            v.nfts,
            a.seller,
            a.currentBid,
            a.highestBidder,
            a.lastBidTime,
            a.active,
            a.ended,
            a.startPrice
        );
    }
    /**
 * @notice Returns timing-related auction data for frontend sync
 */
function getAuctionTiming(uint256 vaultId)
    external
    view
    returns (
        uint256 lastBidTime,
        uint256 bidWindow,
        uint256 endTime,
        bool active,
        bool ended
    )
{
    Auction storage a = vaults[vaultId].auction;

    return (
        a.lastBidTime,
        a.bidWindow,
        a.endTime,
        a.active,
        a.ended
    );
}
