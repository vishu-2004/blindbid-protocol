// ======================
// CHANGES MADE
// ➕ RPC-safe block range scanning (last 9k blocks)
// ➕ Mint detection via Transfer(from=0x0)
// ➕ Safe fallback when mint event not found
// ======================

import { ethers } from "ethers";
import axios from "axios";
import { provider } from "./rpc.service.js";
import erc721Abi from "../abi/erc721.js";

const ERC721_INTERFACE_ID = "0x80ac58cd";
const BLOCK_RANGE_LIMIT = 9000;

export async function indexNFTs(nfts) {
  const results = [];
  const currentBlock = await provider.getBlockNumber();

  for (const nft of nfts) {
    const { contract, tokenId } = nft;

    // -----------------------
    // 0️⃣ CONTRACT VALIDATION
    // -----------------------
    const code = await provider.getCode(contract);
    if (code === "0x") {
      throw new Error("Address is not a smart contract");
    }

    const nftContract = new ethers.Contract(contract, erc721Abi, provider);

    // -----------------------
    // 1️⃣ ERC721 CHECK
    // -----------------------
    let isERC721 = false;
    try {
      isERC721 = await nftContract.supportsInterface(ERC721_INTERFACE_ID);
    } catch {}

    if (!isERC721) {
      throw new Error("Contract is not ERC721 compliant");
    }

    // -----------------------
    // 2️⃣ OPTIONAL CONTRACT DATA
    // -----------------------
    let name = null;
    let symbol = null;
    let totalSupply = null;

    try { name = await nftContract.name(); } catch {}
    try { symbol = await nftContract.symbol(); } catch {}
    try { totalSupply = await nftContract.totalSupply(); } catch {}

    // -----------------------
    // 3️⃣ TOKEN EXISTENCE
    // -----------------------
    let owner;
    try {
      owner = await nftContract.ownerOf(tokenId);
    } catch {
      throw new Error(`Invalid tokenId ${tokenId}`);
    }

    // -----------------------
    // 4️⃣ TRANSFER HISTORY (RPC SAFE)
    // -----------------------
    const fromBlock = Math.max(currentBlock - BLOCK_RANGE_LIMIT, 0);
    const toBlock = currentBlock;

    // 🔴 CHANGE: mint-only filter
    const mintFilter = nftContract.filters.Transfer(
      ethers.ZeroAddress,
      null,
      tokenId
    );

    let mintEvent = null;

    try {
      const mintEvents = await nftContract.queryFilter(
        mintFilter,
        fromBlock,
        toBlock
      );
      if (mintEvents.length > 0) {
        mintEvent = mintEvents[0];
      }
    } catch {
      mintEvent = null;
    }

    let mintBlock = null;
    let mintTx = null;
    let firstOwner = null;
    let mintAgeInBlocks = null;

    if (mintEvent) {
      mintBlock = mintEvent.blockNumber;
      mintTx = mintEvent.transactionHash;
      firstOwner = mintEvent.args.to;
      mintAgeInBlocks = currentBlock - mintBlock;
    }

    // 🔴 CHANGE: freshness logic
    const isFreshMint =
      mintAgeInBlocks !== null && mintAgeInBlocks < 5000;

    // 🔴 CHANGE: assume old if not found
    const hasSecondarySales = false;

    // -----------------------
    // 5️⃣ METADATA
    // -----------------------
    let metadata = null;
    let metadataFlags = {
      missingMetadata: false,
      emptyTraits: false
    };

    try {
      const uri = await nftContract.tokenURI(tokenId);
      const resolvedUri = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
      const res = await axios.get(resolvedUri, { timeout: 5000 });
      metadata = res.data;

      if (!metadata.attributes || metadata.attributes.length === 0) {
        metadataFlags.emptyTraits = true;
      }
    } catch {
      metadataFlags.missingMetadata = true;
    }

    // -----------------------
    // 6️⃣ FINAL RESULT
    // -----------------------
    results.push({
      contractData: {
        address: contract,
        name,
        symbol,
        totalSupply,
        isERC721
      },
      tokenData: {
        tokenId,
        owner
      },
      transferHistory: {
        mintBlock,
        mintTx,
        firstOwner,
        mintAgeInBlocks,
        isFreshMint,
        hasSecondarySales
      },
      metadata,
      metadataFlags
    });
  }

  return results;
}
