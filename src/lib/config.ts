export const LISTING_FEE_SOL = 0.1;
export const LISTING_FEE_LAMPORTS = BigInt(Math.round(LISTING_FEE_SOL * 1_000_000_000));
export const MIN_DEPOSIT_SOL = 0.01;

function envString(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

export const SOLANA_NETWORK =
  envString("NEXT_PUBLIC_SOLANA_NETWORK") === "mainnet-beta"
    ? "mainnet-beta"
    : "devnet";

const DEFAULT_RPC =
  SOLANA_NETWORK === "mainnet-beta"
    ? "https://api.mainnet-beta.solana.com"
    : "https://api.devnet.solana.com";

const configuredRpc = envString("NEXT_PUBLIC_SOLANA_RPC");

export const SOLANA_RPC =
  configuredRpc && /^https?:\/\//i.test(configuredRpc) ? configuredRpc : DEFAULT_RPC;

export const TREASURY_ADDRESS =
  envString("NEXT_PUBLIC_TREASURY_ADDRESS") ??
  "6NXYmQXGxWeymgiu9NjooDDv1LEMuEyuHMGEiLtHAJgf";

export function hasTreasuryConfigured(): boolean {
  return TREASURY_ADDRESS.length >= 32;
}
