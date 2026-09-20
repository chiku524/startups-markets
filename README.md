# startups.markets

Prediction market platform for startup companies. Traders deposit SOL on whether a listed company becomes successful. Founders list a company by paying **0.1 SOL**.

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Set `NEXT_PUBLIC_TREASURY_ADDRESS` to the Solana wallet that should receive listing fees and market deposits. Replace the example address before taking real funds.

Put a Helius key in `HELIUS_API_KEY` (server-only). The app proxies Solana RPC through `/api/solana` so the key is not shipped to the browser.

Default network is **devnet**. Switch to mainnet with:

```
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
```

## Product rules

- Listing a startup sends **0.1 SOL** to the treasury on Devnet, with a memo the app uses to rebuild the market.
- Betting is a parimutuel YES/NO pool. Deposits are the same kind of confirmed SOL transfer.
- The board starts empty. Only on-chain listings appear.

## Deploy

GitHub Actions is not required. Push to GitHub, then:

```bash
npx vercel --prod --yes
```

Add `HELIUS_API_KEY` and the `NEXT_PUBLIC_*` variables in the Vercel project settings. Do not prefix the Helius key with `NEXT_PUBLIC_`.
