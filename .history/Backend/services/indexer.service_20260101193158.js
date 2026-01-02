import { ethers } from "ethers";
import axios from "axios";
import { provider } from "./rpc.service.js";
import erc721Abi from "../abi/erc721.json" assert { type: "json" };

export async function indexNFTs(nfts) {
  const results = [];

  for (const nft of nfts) {
    const { contract, tokenId } = nft;
    const nftContract = new ethers.Contract(contract, erc721Abi, provider);

    // -----------------------
    // 1️⃣ CONTRACT DATA
    // -----------------------
    const name = await nftContract.name();
    const symbol = await nftContract.symbol();

    let totalSupply = null;
    try {
      totalSupply = await nftContract.totalSupply();
    } catch {}

    // -----------------------
    // 2️⃣ TOKEN EXISTENCE
    // -----------------------
    let owner;
    try {
      owner = await nftContract.ownerOf(tokenId);
    } catch {
      throw new Error("Invalid tokenId");
    }

    // -----------------------
    // 3️⃣ TRANSFER HISTORY
    // -----------------------
    const filter = nftContract.filters.Transfer(null, null, tokenId);
    const events = await nftContract.queryFilter(filter, 0, "latest");

    const mintEvent = events[0];
    const mintBlock = mintEvent.blockNumber;
    const mintTx = mintEvent.transactionHash;
    const firstOwner = mintEvent.args.to;

    const totalTransfers = events.length - 1;
    const lastTransferBlock = events[events.length - 1].blockNumber;

    const currentBlock = await provider.getBlockNumber();

    const mintAgeInBlocks = currentBlock - mintBlock;

    const isFreshMint = mintAgeInBlocks < 5000;
    const hasSecondarySales = totalTransfers > 0;

    // -----------------------
    // 4️⃣ METADATA
    // -----------------------
    let metadata = null;
    let metadataFlags = {
      missingMetadata: false,
      emptyTraits: false
    };

    try {
      const uri = await nftContract.tokenURI(tokenId);
      const res = await axios.get(uri);
      metadata = res.data;

      if (!metadata.attributes || metadata.attributes.length === 0) {
        metadataFlags.emptyTraits = true;
      }
    } catch {
      metadataFlags.missingMetadata = true;
    }

    // -----------------------
    // RESULT
    // -----------------------
    results.push({
      contractData: {
        address: contract,
        name,
        symbol,
        totalSupply
      },
      tokenData: {
        tokenId,
        owner
      },
      transferHistory: {
        mintBlock,
        mintTx,
        firstOwner,
        totalTransfers,
        lastTransferBlock,
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
