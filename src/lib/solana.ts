import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { getBrowserRpcUrl, getServerRpcUrl, LISTING_FEE_LAMPORTS, MIN_DEPOSIT_SOL, TREASURY_ADDRESS } from "@/lib/config";

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

export async function buildSolTransfer(params: {
  from: PublicKey;
  lamports: bigint | number;
}): Promise<Transaction> {
  const connection = getConnection();
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("finalized");
  const transaction = new Transaction({
    blockhash,
    lastValidBlockHeight,
    feePayer: params.from,
  });
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: params.from,
      toPubkey: getTreasuryPublicKey(),
      lamports: Number(params.lamports),
    }),
  );
  return transaction;
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

export function lamportsToSol(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL;
}
