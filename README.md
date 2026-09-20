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

Default network is **devnet**. Switch to mainnet with:

```
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_SOLANA_RPC=https://api.mainnet-beta.solana.com
```

## Product rules

- Listing a startup sends **0.1 SOL** to the treasury. The API checks the on-chain transfer before the market goes live.
- Betting is a parimutuel YES/NO pool. Deposits go to the same treasury and are recorded against the market.
- Seed markets ship with the app so the board is not empty on first load.

## Deploy

GitHub Actions is not required. Push to GitHub, then:

```bash
npx vercel --prod --yes
```

Add the same `NEXT_PUBLIC_*` variables in the Vercel project settings.
