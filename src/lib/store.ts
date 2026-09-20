import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { LISTING_FEE_SOL, TREASURY_ADDRESS } from "@/lib/config";
import { SEED_MARKETS, slugify } from "@/lib/markets";
import { getConnection } from "@/lib/solana";
import type { ListingPayload, StartupMarket } from "@/lib/types";

const extraListings: StartupMarket[] = [];
const usedSignatures = new Set<string>();

export function allMarkets(): StartupMarket[] {
  return [...extraListings, ...SEED_MARKETS];
}

export function getMarket(slug: string): StartupMarket | undefined {
  return allMarkets().find((market) => market.slug === slug);
}

function uniqueSlug(name: string): string {
  const base = slugify(name) || "startup";
  let slug = base;
  let n = 2;
  while (getMarket(slug)) {
    slug = `${base}-${n}`;
    n += 1;
  }
  return slug;
}

export async function verifyAndCreateListing(
  payload: ListingPayload,
): Promise<StartupMarket> {
  if (usedSignatures.has(payload.listingTx)) {
    throw new Error("This listing transaction was already used.");
  }
  if (!TREASURY_ADDRESS) {
    throw new Error("Treasury address is not configured on the server.");
  }

  const connection = getConnection();
  const tx = await connection.getTransaction(payload.listingTx, {
    maxSupportedTransactionVersion: 0,
    commitment: "confirmed",
  });

  if (!tx) {
    throw new Error("Listing transaction not found on-chain yet. Wait a few seconds and retry.");
  }
  if (tx.meta?.err) {
    throw new Error("Listing transaction failed on-chain.");
  }

  const accountKeys = tx.transaction.message.getAccountKeys();
  const treasuryIndex = accountKeys.staticAccountKeys.findIndex(
    (key) => key.equals(new PublicKey(TREASURY_ADDRESS)),
  );
  if (treasuryIndex < 0) {
    throw new Error("Listing payment was not sent to the startups.markets treasury.");
  }

  const pre = tx.meta?.preBalances[treasuryIndex] ?? 0;
  const post = tx.meta?.postBalances[treasuryIndex] ?? 0;
  const receivedSol = (post - pre) / LAMPORTS_PER_SOL;
  if (receivedSol + 1e-9 < LISTING_FEE_SOL) {
    throw new Error(`Listing requires ${LISTING_FEE_SOL} SOL. On-chain amount was ${receivedSol} SOL.`);
  }

  const signer = accountKeys.staticAccountKeys[0]?.toBase58();
  if (signer && payload.listedBy && signer !== payload.listedBy) {
    throw new Error("Wallet that paid does not match the listing wallet.");
  }

  const market: StartupMarket = {
    slug: uniqueSlug(payload.name),
    name: payload.name.trim(),
    tagline: payload.tagline.trim(),
    category: payload.category.trim() || "Other",
    description: payload.description.trim(),
    website: payload.website?.trim() || undefined,
    founder: payload.founder.trim(),
    listedAt: new Date().toISOString(),
    listingTx: payload.listingTx,
    listedBy: payload.listedBy,
    status: "open",
    yesPoolSol: 0.1,
    noPoolSol: 0.1,
    question:
      payload.question.trim() ||
      `Will ${payload.name.trim()} become a successful startup on the terms listed?`,
  };

  extraListings.unshift(market);
  usedSignatures.add(payload.listingTx);
  return market;
}

export function addDeposit(slug: string, side: "yes" | "no", amountSol: number): StartupMarket {
  const market = extraListings.find((item) => item.slug === slug) ?? getMarket(slug);
  if (!market) {
    throw new Error("Market not found.");
  }
  if (market.status !== "open") {
    throw new Error("This market is no longer open.");
  }
  if (side === "yes") {
    market.yesPoolSol += amountSol;
  } else {
    market.noPoolSol += amountSol;
  }
  const seeded = SEED_MARKETS.find((item) => item.slug === slug);
  if (seeded && seeded !== market) {
    seeded.yesPoolSol = market.yesPoolSol;
    seeded.noPoolSol = market.noPoolSol;
  }
  return market;
}
