import type { MarketSide, MarketStatus, StartupMarket } from "@/lib/types";

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function totalPool(market: StartupMarket): number {
  return market.yesPoolSol + market.noPoolSol;
}

export function impliedProbability(market: StartupMarket): number {
  const pool = totalPool(market);
  if (pool <= 0) {
    return 0.5;
  }
  return market.yesPoolSol / pool;
}

export function formatSol(amount: number): string {
  return `${amount.toLocaleString(undefined, {
    maximumFractionDigits: amount < 1 ? 3 : 2,
  })} SOL`;
}

export function formatPercent(probability: number): string {
  return `${Math.round(probability * 100)}%`;
}

export function statusLabel(status: MarketStatus): string {
  switch (status) {
    case "open":
      return "Open";
    case "resolved_yes":
      return "Resolved YES";
    case "resolved_no":
      return "Resolved NO";
    default: {
      const exhaustive: never = status;
      return exhaustive;
    }
  }
}

export function sideLabel(side: MarketSide): string {
  switch (side) {
    case "yes":
      return "YES";
    case "no":
      return "NO";
    default: {
      const exhaustive: never = side;
      return exhaustive;
    }
  }
}

export function payoutPreview(
  market: StartupMarket,
  side: MarketSide,
  amountSol: number,
): number {
  if (amountSol <= 0) {
    return 0;
  }
  const nextYes = market.yesPoolSol + (side === "yes" ? amountSol : 0);
  const nextNo = market.noPoolSol + (side === "no" ? amountSol : 0);
  const nextTotal = nextYes + nextNo;
  const winningPool = side === "yes" ? nextYes : nextNo;
  if (winningPool <= 0) {
    return 0;
  }
  return (amountSol / winningPool) * nextTotal;
}
