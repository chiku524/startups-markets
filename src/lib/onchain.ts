import {
  LAMPORTS_PER_SOL,
  PublicKey,
  type ParsedInstruction,
  type ParsedTransactionWithMeta,
  type PartiallyDecodedInstruction,
} from "@solana/web3.js";
import { LISTING_FEE_SOL, TREASURY_ADDRESS } from "@/lib/config";
import { MEMO_PROGRAM_ID } from "@/lib/ids";
import { slugify } from "@/lib/markets";
import { getConnection } from "@/lib/solana";
import type { ListingPayload, MarketSide, StartupMarket } from "@/lib/types";

const MEMO_BYTE_LIMIT = 540;

export type ListingMemo = {
  k: "l";
  slug: string;
  name: string;
  tagline: string;
  category: string;
  founder: string;
  question: string;
  description: string;
  website?: string;
};

export type DepositMemo = {
  k: "d";
  slug: string;
  side: MarketSide;
};

export type MarketMemo = ListingMemo | DepositMemo;

export function listingSlug(name: string, listedBy: string): string {
  const base = slugify(name) || "startup";
  return `${base}-${listedBy.slice(0, 4).toLowerCase()}`.slice(0, 60);
}

export function buildListingMemo(payload: ListingPayload & { slug: string }): string {
  let description = payload.description.trim();
  let memo: ListingMemo = {
    k: "l",
    slug: payload.slug,
    name: payload.name.trim(),
    tagline: payload.tagline.trim(),
    category: payload.category.trim() || "Other",
    founder: payload.founder.trim(),
    question: payload.question.trim(),
    description,
    website: payload.website?.trim() || undefined,
  };
  let encoded = JSON.stringify(memo);
  while (Buffer.byteLength(encoded, "utf8") > MEMO_BYTE_LIMIT && description.length > 0) {
    description = description.slice(0, Math.max(0, description.length - 24));
    memo = { ...memo, description };
    encoded = JSON.stringify(memo);
  }
  if (!memo.website) {
    delete memo.website;
    encoded = JSON.stringify(memo);
  }
  return encoded;
}

export function buildDepositMemo(slug: string, side: MarketSide): string {
  const memo: DepositMemo = { k: "d", slug, side };
  return JSON.stringify(memo);
}

function parseMemo(raw: string): MarketMemo | null {
  try {
    const value = JSON.parse(raw) as MarketMemo;
    if (value.k === "l" && value.slug && value.name) {
      return value;
    }
    if (value.k === "d" && value.slug && (value.side === "yes" || value.side === "no")) {
      return value;
    }
    return null;
  } catch {
    return null;
  }
}

function instructionText(
  instruction: ParsedInstruction | PartiallyDecodedInstruction,
): string | null {
  if ("program" in instruction && instruction.program === "spl-memo") {
    const parsed = instruction.parsed;
    if (typeof parsed === "string") {
      return parsed;
    }
  }
  if ("programId" in instruction && instruction.programId.equals(MEMO_PROGRAM_ID)) {
    const data = "data" in instruction ? instruction.data : undefined;
    if (typeof data === "string") {
      try {
        return Buffer.from(data, "base64").toString("utf8");
      } catch {
        return data;
      }
    }
  }
  return null;
}

export function memoFromTransaction(tx: ParsedTransactionWithMeta): MarketMemo | null {
  const outer = tx.transaction.message.instructions;
  const inner = tx.meta?.innerInstructions?.flatMap((group) => group.instructions) ?? [];
  for (const instruction of [...outer, ...inner]) {
    const text = instructionText(instruction);
    if (!text) {
      continue;
    }
    const parsed = parseMemo(text);
    if (parsed) {
      return parsed;
    }
  }
  return null;
}

export function treasuryDeltaSol(tx: ParsedTransactionWithMeta): number {
  if (!TREASURY_ADDRESS) {
    return 0;
  }
  const treasury = new PublicKey(TREASURY_ADDRESS);
  const index = tx.transaction.message.accountKeys.findIndex((account) =>
    account.pubkey.equals(treasury),
  );
  if (index < 0) {
    return 0;
  }
  const pre = tx.meta?.preBalances[index] ?? 0;
  const post = tx.meta?.postBalances[index] ?? 0;
  return (post - pre) / LAMPORTS_PER_SOL;
}

export function transactionSigner(tx: ParsedTransactionWithMeta): string | undefined {
  return tx.transaction.message.accountKeys.find((account) => account.signer)?.pubkey.toBase58();
}

export async function waitForParsedTransaction(
  signature: string,
): Promise<ParsedTransactionWithMeta> {
  const connection = getConnection();
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const tx = await connection.getParsedTransaction(signature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });
    if (tx && !tx.meta?.err) {
      return tx;
    }
    if (tx?.meta?.err) {
      throw new Error("Transaction failed on-chain.");
    }
    await new Promise((resolve) => setTimeout(resolve, 750));
  }
  throw new Error("Transaction not found on Devnet yet. Wait a few seconds and retry.");
}

let cache: { at: number; markets: StartupMarket[] } | null = null;

export function invalidateMarketCache() {
  cache = null;
}

export async function loadMarketsFromChain(): Promise<StartupMarket[]> {
  if (cache && Date.now() - cache.at < 8_000) {
    return cache.markets;
  }
  if (!TREASURY_ADDRESS) {
    cache = { at: Date.now(), markets: [] };
    return [];
  }

  const connection = getConnection();
  const signatures = await connection.getSignaturesForAddress(new PublicKey(TREASURY_ADDRESS), {
    limit: 80,
  });
  const chronological = [...signatures].reverse();
  const parsed: Array<ParsedTransactionWithMeta | null> = [];
  for (let i = 0; i < chronological.length; i += 6) {
    const chunk = chronological.slice(i, i + 6);
    const txs = await Promise.all(
      chunk.map((item) =>
        connection.getParsedTransaction(item.signature, {
          commitment: "confirmed",
          maxSupportedTransactionVersion: 0,
        }),
      ),
    );
    parsed.push(...txs);
  }

  const markets = new Map<string, StartupMarket>();
  chronological.forEach((item, index) => {
    const tx = parsed[index];
    if (!tx || tx.meta?.err) {
      return;
    }
    const memo = memoFromTransaction(tx);
    const received = treasuryDeltaSol(tx);
    if (!memo || received <= 0) {
      return;
    }
    if (memo.k === "l") {
      if (received + 1e-9 < LISTING_FEE_SOL) {
        return;
      }
      if (markets.has(memo.slug)) {
        return;
      }
      markets.set(memo.slug, {
        slug: memo.slug,
        name: memo.name,
        tagline: memo.tagline,
        category: memo.category,
        description: memo.description,
        website: memo.website,
        founder: memo.founder,
        listedAt: new Date((tx.blockTime ?? 0) * 1000).toISOString(),
        listingTx: item.signature,
        listedBy: transactionSigner(tx),
        status: "open",
        yesPoolSol: 0,
        noPoolSol: 0,
        question: memo.question,
      });
      return;
    }
    const market = markets.get(memo.slug);
    if (!market || market.status !== "open") {
      return;
    }
    if (memo.side === "yes") {
      market.yesPoolSol += received;
    } else {
      market.noPoolSol += received;
    }
  });

  const list = [...markets.values()].sort((a, b) => b.listedAt.localeCompare(a.listedAt));
  cache = { at: Date.now(), markets: list };
  return list;
}
