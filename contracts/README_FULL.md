# Contracts — BlindBid Protocol 🧾

Contains the on-chain components of BlindBid Protocol: `VaultAuction` (main auction/vault contract) and a simple `MonkeyNFT` ERC-721 used for local tests.

---

## Contracts

- `VaultAuction.sol` — vault-based auction contract supporting:
  - Creating vaults containing multiple ERC-721s
  - Creating, starting, bidding on, cancelling, and ending auctions
  - Fixed increment bidding (BID_INCREMENT = 0.1 ether)
  - Auction timing with bid window and auction duration enforcement

- `MonkeyNFT.sol` — simple `ERC721URIStorage` mintable NFT used in examples and local testing.

---

## Quick commands

Install deps & run tests:

```bash
cd contracts
npm install
npm test    # runs hardhat test
npm run compile
```

Run a local Hardhat node:

```bash
npx hardhat node
```

Deploy locally (example script provided):

```bash
# deploys to the current network; for local node:
DEPLOY_NETWORK=local node scripts/deploy.cjs
```

---

## Testing

`test/VaultAuction.test.js` contains core tests for the auction lifecycle (create vault, create auction, start auction, bid, end, refunds/transfer checks). Run tests with `npm test`.

---

## Development notes

- `hardhat.config.cjs` is minimal; add network configuration if deploying to testnets or mainnet.
- Deployment script `scripts/deploy.cjs` prints deployed addresses and is environment-driven.
- Add `.env` for private keys and RPC URLs if you plan to deploy to public testnets.

---

If you want, I can add a `CONTRIBUTING.md` section for contract review checklist and a `SECURITY.md` for auditing tips.