import { LISTING_FEE_SOL, MIN_DEPOSIT_SOL, TREASURY_ADDRESS } from "@/lib/config";
import {
  invalidateMarketCache,
  loadMarketsFromChain,
  memoFromTransaction,
  transactionSigner,
  treasuryDeltaSol,
  waitForParsedTransaction,
} from "@/lib/onchain";
import type { ListingPayload, StartupMarket } from "@/lib/types";

export async function allMarkets(): Promise<StartupMarket[]> {
  return loadMarketsFromChain();
}

export async function getMarket(slug: string): Promise<StartupMarket | undefined> {
  const markets = await allMarkets();
  return markets.find((market) => market.slug === slug);
}

export async function verifyAndCreateListing(payload: ListingPayload): Promise<StartupMarket> {
  if (!TREASURY_ADDRESS) {
    throw new Error("Treasury address is not configured on the server.");
  }

  const tx = await waitForParsedTransaction(payload.listingTx);
  const received = treasuryDeltaSol(tx);
  if (received + 1e-9 < LISTING_FEE_SOL) {
    throw new Error(
      `Listing requires ${LISTING_FEE_SOL} SOL on Devnet. On-chain amount was ${received} SOL.`,
    );
  }

  const signer = transactionSigner(tx);
  if (signer && payload.listedBy && signer !== payload.listedBy) {
    throw new Error("Wallet that paid does not match the listing wallet.");
  }

  const memo = memoFromTransaction(tx);
  if (!memo || memo.k !== "l") {
    throw new Error("Listing transaction is missing the market memo.");
  }

  invalidateMarketCache();
  const markets = await loadMarketsFromChain();
  const fromChain = markets.find((market) => market.listingTx === payload.listingTx);
  if (fromChain) {
    return fromChain;
  }

  return {
    slug: memo.slug,
    name: memo.name,
    tagline: memo.tagline,
    category: memo.category,
    description: memo.description,
    website: memo.website,
    founder: memo.founder,
    listedAt: new Date().toISOString(),
    listingTx: payload.listingTx,
    listedBy: payload.listedBy,
    status: "open",
    yesPoolSol: 0,
    noPoolSol: 0,
    question: memo.question,
  };
}

export async function verifyAndAddDeposit(
  slug: string,
  txSignature: string,
): Promise<StartupMarket> {
  const tx = await waitForParsedTransaction(txSignature);
  const memo = memoFromTransaction(tx);
  if (!memo || memo.k !== "d" || memo.slug !== slug) {
    throw new Error("Deposit transaction is missing a matching market memo.");
  }
  const received = treasuryDeltaSol(tx);
  if (received + 1e-9 < MIN_DEPOSIT_SOL) {
    throw new Error(`Minimum deposit is ${MIN_DEPOSIT_SOL} SOL. On-chain amount was ${received} SOL.`);
  }

  invalidateMarketCache();
  const market = await getMarket(slug);
  if (!market) {
    throw new Error("Market not found on-chain. List the company first.");
  }
  return market;
}
