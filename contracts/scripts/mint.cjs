const hre = require("hardhat");

async function main() {
  const [owner] = await hre.ethers.getSigners();

  const monkeyNFT = await hre.ethers.getContractAt(
    "MonkeyNFT",
    process.env.DEPLOY_NETWORK === "local" ? process.env.MONKEY_NFT_ADDRESS_LOCAL : process.env.MONKEY_NFT_ADDRESS_PROD
  );

  // 🔴 CHANGE: IPFS metadata URIs
  const uris = [
    "ipfs://bafkreietqdacjfth3rtmh43etz3ottqqgv5hroxqarkizr6l7i2qxmpkvi",
    "ipfs://bafkreicqpgdvangjp6brzpinjdwb47hrf4ey24626lqjl7mlcfgf5tcgb4",
    "ipfs://bafkreia7so4duzlvqit4rcphvdatvxtptzieak5scokjkxl2n24u4azz3y",
  ];

  for (let i = 0; i < uris.length; i++) {
    // 🔴 CHANGE: read tokenCounter BEFORE mint
    const tokenId = await monkeyNFT.tokenCounter();
    const address = process.env.DEPLOY_NETWORK === "local" ? "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" : "0xA2aE46532e6F1b24fF0C309e3975180055a4b23C";

    const tx = await monkeyNFT.mintMonkey(address, uris[i]);
    await tx.wait();

    console.log(`✅ Minted tokenId ${tokenId.toString()} → ${address}`);
  }

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
