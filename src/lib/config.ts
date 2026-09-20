export const LISTING_FEE_SOL = 0.1;
export const LISTING_FEE_LAMPORTS = BigInt(Math.round(LISTING_FEE_SOL * 1_000_000_000));
export const MIN_DEPOSIT_SOL = 0.01;

export const SOLANA_NETWORK =
  process.env.NEXT_PUBLIC_SOLANA_NETWORK === "mainnet-beta"
    ? "mainnet-beta"
    : "devnet";

export const SOLANA_RPC =
  process.env.NEXT_PUBLIC_SOLANA_RPC ??
  (SOLANA_NETWORK === "mainnet-beta"
    ? "https://api.mainnet-beta.solana.com"
    : "https://api.devnet.solana.com");

export const TREASURY_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_ADDRESS ?? "";

export function hasTreasuryConfigured(): boolean {
  return TREASURY_ADDRESS.length >= 32;
}
