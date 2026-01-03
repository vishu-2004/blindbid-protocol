# Frontend — BlindBid Protocol 🖥️

React + Vite frontend that guides users through verifying NFTs, approving transfers, creating vaults, and starting auctions.

---

## ⚡ Quick start

1. Install

```bash
cd frontend
npm install
```

2. Env variables

Create `.env` in `frontend/` with:

```
VITE_API_BASE_URL=http://localhost:3001
```

This is required — the app queries the verification API at `/api/vault/verify`.

3. Run dev server

```bash
npm run dev
```

4. Build for production

```bash
npm run build
npm run preview
```

---

## 🧭 App Overview

- Uses `wagmi` + `viem` for wallet connections and contract calls
- `src/hooks/useCreateVault.ts` contains the main flow (verify -> approve -> create vault -> create auction)
- `src/abi/` contains pre-built contract ABIs used by the UI

---

## 🛠️ Notes for Developers

- The frontend requires `VITE_API_BASE_URL` to be present at build time. Vite enforces `VITE_` prefix for env vars.
- UI interactions assume deployed `VaultAuction` contract address is configured via `getContractAddress()` (see `src/utils/contract.ts`).

---

If you'd like, I can add a short developer troubleshooting section for common errors (wallet connection, network mismatches, CORS issues, etc.).