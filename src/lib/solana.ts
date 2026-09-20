import { Buffer } from "buffer";
import {
  ComputeBudgetProgram,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  getBrowserRpcUrl,
  getServerRpcUrl,
  LISTING_FEE_LAMPORTS,
  MIN_DEPOSIT_SOL,
  TREASURY_ADDRESS,
} from "@/lib/config";
import { MEMO_PROGRAM_ID } from "@/lib/ids";

export function getConnection(): Connection {
  const endpoint = typeof window === "undefined" ? getServerRpcUrl() : getBrowserRpcUrl();
  return new Connection(endpoint, "confirmed");
}

export function getTreasuryPublicKey(): PublicKey {
  if (!TREASURY_ADDRESS) {
    throw new Error("Treasury address is not configured.");
  }
  return new PublicKey(TREASURY_ADDRESS);
}

function memoInstruction(message: string): TransactionInstruction {
  return new TransactionInstruction({
    keys: [],
    programId: MEMO_PROGRAM_ID,
    data: Buffer.from(message, "utf8"),
  });
}

export async function buildSolTransfer(params: {
  from: PublicKey;
  lamports: bigint | number;
  memo: string;
  connection: Connection;
}): Promise<Transaction> {
  const { blockhash, lastValidBlockHeight } = await params.connection.getLatestBlockhash(
    "finalized",
  );
  const transaction = new Transaction({
    blockhash,
    lastValidBlockHeight,
    feePayer: params.from,
  });
  transaction.add(
    ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 100_000 }),
    SystemProgram.transfer({
      fromPubkey: params.from,
      toPubkey: getTreasuryPublicKey(),
      lamports: Number(params.lamports),
    }),
    memoInstruction(params.memo),
  );
  return transaction;
}

export async function sendAndConfirmTransfer(params: {
  transaction: Transaction;
  connection: Connection;
  sendTransaction: (
    transaction: Transaction,
    connection: Connection,
    options?: {
      skipPreflight?: boolean;
      preflightCommitment?: "processed" | "confirmed" | "finalized";
      maxRetries?: number;
    },
  ) => Promise<string>;
}): Promise<string> {
  const signature = await params.sendTransaction(params.transaction, params.connection, {
    skipPreflight: false,
    preflightCommitment: "confirmed",
    maxRetries: 5,
  });
  const blockhash = params.transaction.recentBlockhash;
  const lastValidBlockHeight = params.transaction.lastValidBlockHeight;
  if (blockhash && lastValidBlockHeight) {
    await params.connection.confirmTransaction(
      { signature, blockhash, lastValidBlockHeight },
      "confirmed",
    );
  } else {
    await params.connection.confirmTransaction(signature, "confirmed");
  }
  return signature;
}

export function listingFeeLamports(): number {
  return Number(LISTING_FEE_LAMPORTS);
}

export function depositLamports(sol: number): number {
  if (sol < MIN_DEPOSIT_SOL) {
    throw new Error(`Minimum deposit is ${MIN_DEPOSIT_SOL} SOL.`);
  }
  return Math.round(sol * LAMPORTS_PER_SOL);
}
