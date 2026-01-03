# Backend — BlindBid Protocol 🔧

Express-based API that performs off-chain verification, indexing, rarity calculation, and value estimation for NFTs.

---

## 🚀 Quick start

1. Install

```bash
cd backend
npm install
```

2. Environment variables (.env)

Create a `.env` in `backend/` with the following (example):

```
PORT=3001
NETWORK=local           # local|testnet|mainnet
LOCAL_RPC_URL=http://127.0.0.1:8545
TESTNET_RPC_URL=https://rpc.testnet.example
MAINNET_RPC_URL=https://mainnet.infura.io/v3/<KEY>
```

3. Run

```bash
npm run dev
```

---

## 🔗 API

### POST /api/vault/verify

Request body:

```json
{
  "nfts": [
    { "contract": "0x...", "tokenId": "1" },
    { "contract": "0x...", "tokenId": "2" }
  ]
}
```

Response (example):

```json
{
  "status": "approved_with_risk",
  "approved": true,
  "reason": "Fresh mint risk detected, but NFTs are valid",
  "summary": { /* summarised valuation + rarity */ }
}
```

This endpoint performs 3 steps:
- Index on-chain data for each NFT
- Calculate rarity breakdown
- Estimate value and produce a recommended start price

---

## 🧩 Services

Key services in `backend/services/`:
- `rpc.service.js` — resolves target RPC URL (based on `NETWORK` env)
- `indexer.service.js` — gets NFT metadata + on-chain data
- `rarity.service.js` — computes rarity breakdown
- `valuation.service.js` — returns estimated price bands

---

## 🧪 Tests

No unit tests currently for backend. Add tests under `backend/test/` and script entries in `package.json` when adding tests.

---

## 📝 Notes

- Keep `.env` secrets secure. Do not commit `.env` to git.
- The backend expects the RPC URL and `NETWORK` to be set; otherwise it will throw on startup.

---

If you want, I can add OpenAPI schema or Postman collection for the endpoints, or add integration tests for the verification flow.