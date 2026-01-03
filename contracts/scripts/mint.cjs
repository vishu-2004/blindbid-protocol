const hre = require("hardhat");

async function main() {
  const [owner] = await hre.ethers.getSigners();

  const monkeyNFT = await hre.ethers.getContractAt(
    "MonkeyNFT",
    "0xb8ca02466Ed3DA6f9E68E5E53bF54eDdE1CfdE3F"
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
    const address = "0x058Ae0989eD9571B16ff50681c774e6fb2fC066b";

    const tx = await monkeyNFT.mintMonkey(address, uris[i]);
    await tx.wait();

    console.log(`✅ Minted tokenId ${tokenId.toString()} → ${address}`);
  }

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
