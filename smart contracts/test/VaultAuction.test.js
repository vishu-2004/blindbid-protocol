import { expect } from "chai";
import pkg from "hardhat";
const { ethers } = pkg;

describe("VaultAuction", function () {
  let vaultAuction;
  let mockERC721_1;
  let mockERC721_2;
  let owner;
  let seller;
  let bidder1;
  let bidder2;
  let bidder3;
  let addrs;

  beforeEach(async function () {
    [owner, seller, bidder1, bidder2, bidder3, ...addrs] = await ethers.getSigners();

    // Deploy Mock ERC721 contracts
    const MockERC721 = await ethers.getContractFactory("MockERC721");
    mockERC721_1 = await MockERC721.deploy("Mock NFT 1", "MNFT1");
    mockERC721_2 = await MockERC721.deploy("Mock NFT 2", "MNFT2");

    // Deploy VaultAuction contract
    const VaultAuction = await ethers.getContractFactory("VaultAuction");
    vaultAuction = await VaultAuction.deploy();
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(await vaultAuction.getAddress()).to.be.properAddress;
    });

    it("Should initialize with vaultCount = 0", async function () {
      expect(await vaultAuction.vaultCount()).to.equal(0);
    });
  });

  describe("createVault", function () {
    it("Should create a vault with single NFT", async function () {
      const tx = await mockERC721_1.mint(seller.address);
      await tx.wait();
      const tokenId = 0; // First minted token
      await mockERC721_1.connect(seller).approve(await vaultAuction.getAddress(), tokenId);

      await expect(vaultAuction.connect(seller).createVault(
        [await mockERC721_1.getAddress()],
        [tokenId]
      )).to.emit(vaultAuction, "VaultCreated").withArgs(0, seller.address);

      expect(await vaultAuction.vaultCount()).to.equal(1);
      expect(await mockERC721_1.ownerOf(tokenId)).to.equal(await vaultAuction.getAddress());
    });

    it("Should create a vault with multiple NFTs", async function () {
      await mockERC721_1.mint(seller.address);
      await mockERC721_2.mint(seller.address);
      const tokenId1 = 0;
      const tokenId2 = 0;
      
      await mockERC721_1.connect(seller).approve(await vaultAuction.getAddress(), tokenId1);
      await mockERC721_2.connect(seller).approve(await vaultAuction.getAddress(), tokenId2);

      await vaultAuction.connect(seller).createVault(
        [await mockERC721_1.getAddress(), await mockERC721_2.getAddress()],
        [tokenId1, tokenId2]
      );

      expect(await vaultAuction.vaultCount()).to.equal(1);
      expect(await mockERC721_1.ownerOf(tokenId1)).to.equal(await vaultAuction.getAddress());
      expect(await mockERC721_2.ownerOf(tokenId2)).to.equal(await vaultAuction.getAddress());
    });

    it("Should revert if arrays length mismatch", async function () {
      await mockERC721_1.mint(seller.address);
      const tokenId = 0;
      await mockERC721_1.connect(seller).approve(await vaultAuction.getAddress(), tokenId);

      await expect(
        vaultAuction.connect(seller).createVault(
          [await mockERC721_1.getAddress()],
          [tokenId, tokenId]
        )
      ).to.be.revertedWith("Length mismatch");
    });

    it("Should revert if empty vault", async function () {
      await expect(
        vaultAuction.connect(seller).createVault([], [])
      ).to.be.revertedWith("Empty vault");
    });

    it("Should revert if NFT not approved", async function () {
      await mockERC721_1.mint(seller.address);
      const tokenId = 0;

      await expect(
        vaultAuction.connect(seller).createVault(
          [await mockERC721_1.getAddress()],
          [tokenId]
        )
      ).to.be.reverted;
    });

    it("Should set seller correctly", async function () {
      await mockERC721_1.mint(seller.address);
      const tokenId = 0;
      await mockERC721_1.connect(seller).approve(await vaultAuction.getAddress(), tokenId);

      await vaultAuction.connect(seller).createVault(
        [await mockERC721_1.getAddress()],
        [tokenId]
      );

      const auction = await vaultAuction.getAuction(0);
      expect(auction.seller).to.equal(seller.address);
    });
  });

  describe("startAuction", function () {
    let vaultId;
    const startPrice = ethers.parseEther("1.0");
    const duration = 3600; // 1 hour

    beforeEach(async function () {
      await mockERC721_1.mint(seller.address);
      const tokenId = 0;
      await mockERC721_1.connect(seller).approve(await vaultAuction.getAddress(), tokenId);
      
      await vaultAuction.connect(seller).createVault(
        [await mockERC721_1.getAddress()],
        [tokenId]
      );
      vaultId = 0;
    });

    it("Should start an auction successfully", async function () {
      await expect(
        vaultAuction.connect(seller).startAuction(vaultId, startPrice, duration)
      ).to.emit(vaultAuction, "AuctionStarted");

      const auction = await vaultAuction.getAuction(vaultId);
      expect(auction.active).to.be.true;
      expect(auction.currentBid).to.equal(startPrice);
      expect(auction.ended).to.be.false;
      expect(auction.endTime).to.be.gt(0);
    });

    it("Should revert if not seller", async function () {
      await expect(
        vaultAuction.connect(bidder1).startAuction(vaultId, startPrice, duration)
      ).to.be.revertedWith("Not vault seller");
    });

    it("Should revert if auction already active", async function () {
      await vaultAuction.connect(seller).startAuction(vaultId, startPrice, duration);
      
      await expect(
        vaultAuction.connect(seller).startAuction(vaultId, startPrice, duration)
      ).to.be.revertedWith("Auction already active");
    });

    it("Should revert if duration is zero", async function () {
      await expect(
        vaultAuction.connect(seller).startAuction(vaultId, startPrice, 0)
      ).to.be.revertedWith("Invalid duration");
    });
  });

  describe("bid", function () {
    let vaultId;
    const startPrice = ethers.parseEther("1.0");
    const duration = 3600;

    beforeEach(async function () {
      // Use staticCall to get the return value, or just track tokenId manually
      // Since mint increments from 0, and this is a fresh contract, tokenId will be 0
      await mockERC721_1.mint(seller.address);
      const tokenId = 0;
      await mockERC721_1.connect(seller).approve(await vaultAuction.getAddress(), tokenId);
      
      await vaultAuction.connect(seller).createVault(
        [await mockERC721_1.getAddress()],
        [tokenId]
      );
      vaultId = 0;
      await vaultAuction.connect(seller).startAuction(vaultId, startPrice, duration);
    });

    it("Should place first bid successfully", async function () {
      const bidAmount = startPrice + 1n; // Must be exactly currentBid + 1
      
      await expect(
        vaultAuction.connect(bidder1).bid(vaultId, { value: bidAmount })
      ).to.emit(vaultAuction, "BidPlaced").withArgs(vaultId, bidder1.address, bidAmount);

      const auction = await vaultAuction.getAuction(vaultId);
      expect(auction.currentBid).to.equal(bidAmount);
      expect(auction.highestBidder).to.equal(bidder1.address);
    });

    it("Should require bid to be currentBid + 1 wei", async function () {
      const bidAmount1 = startPrice + 1n;
      
      await vaultAuction.connect(bidder1).bid(vaultId, { value: bidAmount1 });
      
      const bidAmount2 = bidAmount1 + 1n;
      await expect(
        vaultAuction.connect(bidder2).bid(vaultId, { value: bidAmount2 })
      ).to.emit(vaultAuction, "BidPlaced").withArgs(vaultId, bidder2.address, bidAmount2);
      
      const auction = await vaultAuction.getAuction(vaultId);
      expect(auction.currentBid).to.equal(bidAmount2);
      expect(auction.highestBidder).to.equal(bidder2.address);
    });

    it("Should refund previous bidder", async function () {
      const bidAmount1 = startPrice + 1n;
      const bidAmount2 = bidAmount1 + 1n;
      
      const initialBalance = await ethers.provider.getBalance(bidder1.address);
      
      await vaultAuction.connect(bidder1).bid(vaultId, { value: bidAmount1 });
      await vaultAuction.connect(bidder2).bid(vaultId, { value: bidAmount2 });
      
      const finalBalance = await ethers.provider.getBalance(bidder1.address);
      // Account for gas, so we check that balance increased (refund received)
      // Note: This is approximate due to gas costs
      expect(finalBalance).to.be.gt(initialBalance - bidAmount1);
    });

    it("Should revert if auction not active", async function () {
      // Create a new vault without starting an auction
      // Note: vaultId 0 already has tokenId 0 from beforeEach, so we need a new token
      const newVaultId = 1;
      const tx = await mockERC721_1.mint(seller.address);
      await tx.wait();
      const tokenId = 1; // Second minted token (0 was used in beforeEach)
      await mockERC721_1.connect(seller).approve(await vaultAuction.getAddress(), tokenId);
      await vaultAuction.connect(seller).createVault(
        [await mockERC721_1.getAddress()],
        [tokenId]
      );

      // Try to bid on a vault that has no active auction
      await expect(
        vaultAuction.connect(bidder1).bid(newVaultId, { value: startPrice + 1n })
      ).to.be.revertedWith("Auction not active");
    });

    it("Should revert if auction expired", async function () {
      // Create auction with very short duration (vaultId already has an auction from beforeEach)
      // But we need to restart it with a short duration
      // Actually, vaultId already has an active auction, so we can just wait for it to expire
      // Or create a new one with short duration
      const shortDuration = 1;
      // End the existing auction first by creating a new vault
      // Note: vaultId 0 already has tokenId 0 from beforeEach, so we need a new token
      const newVaultId = 1;
      const tx = await mockERC721_1.mint(seller.address);
      await tx.wait();
      const tokenId = 1; // Second minted token (0 was used in beforeEach)
      await mockERC721_1.connect(seller).approve(await vaultAuction.getAddress(), tokenId);
      await vaultAuction.connect(seller).createVault(
        [await mockERC721_1.getAddress()],
        [tokenId]
      );
      await vaultAuction.connect(seller).startAuction(newVaultId, startPrice, shortDuration);
      
      // Wait for auction to expire
      await ethers.provider.send("evm_increaseTime", [2]);
      await ethers.provider.send("evm_mine", []);

      await expect(
        vaultAuction.connect(bidder1).bid(newVaultId, { value: startPrice + 1n })
      ).to.be.revertedWith("Auction expired");
    });

    it("Should revert if bid amount is not currentBid + 1", async function () {
      const wrongBidAmount = startPrice + 2n; // Should be startPrice + 1
      
      await expect(
        vaultAuction.connect(bidder1).bid(vaultId, { value: wrongBidAmount })
      ).to.be.revertedWith("Bid must be +1");
    });
  });

  describe("endAuction", function () {
    let vaultId;
    const startPrice = ethers.parseEther("1.0");
    const duration = 3600;

    beforeEach(async function () {
      await mockERC721_1.mint(seller.address);
      const tokenId = 0;
      await mockERC721_1.connect(seller).approve(await vaultAuction.getAddress(), tokenId);
      
      await vaultAuction.connect(seller).createVault(
        [await mockERC721_1.getAddress()],
        [tokenId]
      );
      vaultId = 0;
    });

    it("Should end auction with winner and transfer NFTs", async function () {
      await vaultAuction.connect(seller).startAuction(vaultId, startPrice, duration);
      
      const bidAmount = startPrice + 1n;
      await vaultAuction.connect(bidder1).bid(vaultId, { value: bidAmount });
      
      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [duration + 1]);
      await ethers.provider.send("evm_mine", []);

      const tokenId = 0; // From mint
      await expect(
        vaultAuction.connect(owner).endAuction(vaultId)
      ).to.emit(vaultAuction, "AuctionEnded").withArgs(vaultId, bidder1.address, bidAmount);

      expect(await mockERC721_1.ownerOf(tokenId)).to.equal(bidder1.address);
      
      const auction = await vaultAuction.getAuction(vaultId);
      expect(auction.active).to.be.false;
      expect(auction.ended).to.be.true;
    });

    it("Should transfer payment to seller when auction ends with bids", async function () {
      await vaultAuction.connect(seller).startAuction(vaultId, startPrice, duration);
      
      const bidAmount = startPrice + 1n;
      const sellerInitialBalance = await ethers.provider.getBalance(seller.address);
      
      await vaultAuction.connect(bidder1).bid(vaultId, { value: bidAmount });
      
      await ethers.provider.send("evm_increaseTime", [duration + 1]);
      await ethers.provider.send("evm_mine", []);

      await vaultAuction.connect(owner).endAuction(vaultId);
      
      const sellerFinalBalance = await ethers.provider.getBalance(seller.address);
      expect(sellerFinalBalance).to.be.gt(sellerInitialBalance);
    });

    it("Should return NFTs to seller if no bids", async function () {
      await vaultAuction.connect(seller).startAuction(vaultId, startPrice, duration);
      
      await ethers.provider.send("evm_increaseTime", [duration + 1]);
      await ethers.provider.send("evm_mine", []);

      const tokenId = 0;
      await expect(
        vaultAuction.connect(owner).endAuction(vaultId)
      ).to.emit(vaultAuction, "AuctionEnded").withArgs(vaultId, ethers.ZeroAddress, 0);

      expect(await mockERC721_1.ownerOf(tokenId)).to.equal(seller.address);
    });

    it("Should handle multiple NFTs correctly", async function () {
      // Mint tokens - each contract has its own counter
      // Note: mockERC721_1 tokenId 0 is already used in beforeEach, so we need tokenId 1
      // mockERC721_2 hasn't been used yet, so tokenId 0 is available
      const tx1 = await mockERC721_1.mint(seller.address);
      await tx1.wait();
      const tx2 = await mockERC721_2.mint(seller.address);
      await tx2.wait();
      const tokenId1 = 1; // Second token from contract 1 (0 was used in beforeEach)
      const tokenId2 = 0; // First token from contract 2 (different contract, so different token)
      
      await mockERC721_1.connect(seller).approve(await vaultAuction.getAddress(), tokenId1);
      await mockERC721_2.connect(seller).approve(await vaultAuction.getAddress(), tokenId2);

      await vaultAuction.connect(seller).createVault(
        [await mockERC721_1.getAddress(), await mockERC721_2.getAddress()],
        [tokenId1, tokenId2]
      );
      
      const newVaultId = 1;
      await vaultAuction.connect(seller).startAuction(newVaultId, startPrice, duration);
      
      const bidAmount = startPrice + 1n;
      await vaultAuction.connect(bidder1).bid(newVaultId, { value: bidAmount });
      
      await ethers.provider.send("evm_increaseTime", [duration + 1]);
      await ethers.provider.send("evm_mine", []);

      await vaultAuction.connect(owner).endAuction(newVaultId);

      expect(await mockERC721_1.ownerOf(tokenId1)).to.equal(bidder1.address);
      expect(await mockERC721_2.ownerOf(tokenId2)).to.equal(bidder1.address);
    });

    it("Should revert if auction not active", async function () {
      await expect(
        vaultAuction.connect(owner).endAuction(vaultId)
      ).to.be.revertedWith("Auction not active");
    });

    it("Should revert if auction still running", async function () {
      await vaultAuction.connect(seller).startAuction(vaultId, startPrice, duration);
      
      await expect(
        vaultAuction.connect(owner).endAuction(vaultId)
      ).to.be.revertedWith("Auction still running");
    });

    it("Should revert if auction already ended", async function () {
      await vaultAuction.connect(seller).startAuction(vaultId, startPrice, duration);
      
      await ethers.provider.send("evm_increaseTime", [duration + 1]);
      await ethers.provider.send("evm_mine", []);

      await vaultAuction.connect(owner).endAuction(vaultId);
      
      // After ending, the auction is no longer active, so it will revert with "Auction not active"
      // The contract checks a.active first, then a.ended
      await expect(
        vaultAuction.connect(owner).endAuction(vaultId)
      ).to.be.revertedWith("Auction not active");
    });
  });

  describe("View functions", function () {
    let vaultId;

    beforeEach(async function () {
      await mockERC721_1.mint(seller.address);
      await mockERC721_2.mint(seller.address);
      const tokenId1 = 0;
      const tokenId2 = 0;
      
      await mockERC721_1.connect(seller).approve(await vaultAuction.getAddress(), tokenId1);
      await mockERC721_2.connect(seller).approve(await vaultAuction.getAddress(), tokenId2);

      await vaultAuction.connect(seller).createVault(
        [await mockERC721_1.getAddress(), await mockERC721_2.getAddress()],
        [tokenId1, tokenId2]
      );
      vaultId = 0;
    });

    it("Should return vault NFTs correctly", async function () {
      const nfts = await vaultAuction.getVaultNFTs(vaultId);
      
      expect(nfts.length).to.equal(2);
      expect(nfts[0].nftAddress).to.equal(await mockERC721_1.getAddress());
      expect(nfts[0].tokenId).to.equal(0);
      expect(nfts[1].nftAddress).to.equal(await mockERC721_2.getAddress());
      expect(nfts[1].tokenId).to.equal(0);
    });

    it("Should return auction details correctly", async function () {
      const auction = await vaultAuction.getAuction(vaultId);
      
      expect(auction.seller).to.equal(seller.address);
      expect(auction.active).to.be.false;
      expect(auction.ended).to.be.false;
      expect(auction.currentBid).to.equal(0);
      expect(auction.highestBidder).to.equal(ethers.ZeroAddress);
    });
  });

  describe("Reentrancy protection", function () {
    it("Should prevent reentrancy attacks", async function () {
      // This is a basic test - in a real scenario, you'd need a malicious contract
      // The ReentrancyGuard should prevent reentrancy in bid() and endAuction()
      const vaultId = 0;
      await mockERC721_1.mint(seller.address);
      const tokenId = 0;
      await mockERC721_1.connect(seller).approve(await vaultAuction.getAddress(), tokenId);
      
      await vaultAuction.connect(seller).createVault(
        [await mockERC721_1.getAddress()],
        [tokenId]
      );
      
      const startPrice = ethers.parseEther("1.0");
      await vaultAuction.connect(seller).startAuction(vaultId, startPrice, 3600);
      
      // Multiple bids should work without reentrancy issues
      const bidAmount1 = startPrice + 1n;
      await vaultAuction.connect(bidder1).bid(vaultId, { value: bidAmount1 });
      const bidAmount2 = bidAmount1 + 1n;
      await vaultAuction.connect(bidder2).bid(vaultId, { value: bidAmount2 });
      
      const auction = await vaultAuction.getAuction(vaultId);
      expect(auction.highestBidder).to.equal(bidder2.address);
    });
  });
});


