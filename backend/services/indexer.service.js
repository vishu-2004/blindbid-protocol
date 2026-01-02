import { ethers } from "ethers";
import axios from "axios";
import { provider } from "./rpc.service.js";
import erc721Abi from "../abi/erc721.js";

const ERC721_INTERFACE_ID = "0x80ac58cd";

export async function indexNFTs(nfts) {
  const results = [];

  for (const nft of nfts) {
    const { contract, tokenId } = nft;

    // -----------------------
    // 0️⃣ CONTRACT VALIDATION (NEW)
    // -----------------------
    const code = await provider.getCode(contract);
    console.log(contract);
    if (code === "0x") {
      throw new Error("Address is not a smart contract");
    }

    const nftContract = new ethers.Contract(contract, erc721Abi, provider);

    // -----------------------
    // 1️⃣ ERC721 CHECK (NEW)
    // -----------------------
    let isERC721 = false;
    try {
      isERC721 = await nftContract.supportsInterface(ERC721_INTERFACE_ID);
    } catch {}

    if (!isERC721) {
      throw new Error("Contract is not ERC721 compliant");
    }

    // -----------------------
    // 2️⃣ OPTIONAL CONTRACT DATA (FIX)
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
    // 4️⃣ TRANSFER HISTORY
    // -----------------------
    const filter = nftContract.filters.Transfer(null, null, tokenId);
    const events = await nftContract.queryFilter(filter, 0, "latest");

    if (!events.length) {
      throw new Error("No transfer history found");
    }

    const mintEvent = events[0];
    const mintBlock = mintEvent.blockNumber;
    const mintTx = mintEvent.transactionHash;
    const firstOwner = mintEvent.args.to;

    const totalTransfers = Math.max(events.length - 1, 0);
    const lastTransferBlock = events[events.length - 1].blockNumber;

    const currentBlock = await provider.getBlockNumber();
    const mintAgeInBlocks = currentBlock - mintBlock;

    const isFreshMint = mintAgeInBlocks < 5000;
    const hasSecondarySales = totalTransfers > 0;

    // -----------------------
    // 5️⃣ METADATA (SAFE)
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
