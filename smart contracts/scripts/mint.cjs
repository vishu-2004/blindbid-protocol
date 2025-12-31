const hre = require("hardhat");

async function main() {
  const [owner] = await hre.ethers.getSigners();

  const monkeyNFT = await hre.ethers.getContractAt(
    "MonkeyNFT",
    "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
  );

  // 🔴 CHANGE: IPFS metadata URIs
  const uris = [
    "ipfs://bafkreietqdacjfth3rtmh43etz3ottqqgv5hroxqarkizr6l7i2qxmpkvi",
    "ipfs://bafkreicqpgdvangjp6brzpinjdwb47hrf4ey24626lqjl7mlcfgf5tcgb4",
    "ipfs://bafkreia7so4duzlvqit4rcphvdatvxtptzieak5scokjkxl2n24u4azz3y",
  ];

  for (let i = 0; i < uris.length; i++) {
    // 🔴 CHANGE: minting NFT to owner
    const tx = await monkeyNFT.mintMonkey(owner.address, uris[i]);
    await tx.wait();

    console.log(`Minted NFT ${i} to ${owner.address}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
