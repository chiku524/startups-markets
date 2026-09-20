import type { MarketSide, MarketStatus, StartupMarket } from "@/lib/types";

export const SEED_MARKETS: StartupMarket[] = [
  {
    slug: "lumen-labs",
    name: "Lumen Labs",
    tagline: "On-device models for hardware startups",
    category: "AI",
    description:
      "Lumen Labs ships a tiny inference stack that runs on factory-floor hardware. Traders are pricing whether the team can land a Series A and three production deployments in the next 18 months.",
    website: "https://startups.markets",
    founder: "Amina Shah",
    listedAt: "2026-08-12T14:00:00.000Z",
    status: "open",
    yesPoolSol: 42.4,
    noPoolSol: 18.1,
    question: "Will Lumen Labs raise a priced round of $8M+ by Dec 2027?",
  },
  {
    slug: "harbor-freight-software",
    name: "Harbor",
    tagline: "Treasury software for seed-stage companies",
    category: "Fintech",
    description:
      "Harbor replaces spreadsheets with a crypto-native treasury desk: runway, payroll, and cap table in one ledger. The market is betting on whether they become the default back office for YC-like batches.",
    founder: "Jonah Park",
    listedAt: "2026-07-03T09:30:00.000Z",
    status: "open",
    yesPoolSol: 31.0,
    noPoolSol: 29.6,
    question: "Will Harbor reach $2M ARR within 24 months of listing?",
  },
  {
    slug: "nori-health",
    name: "Nori Health",
    tagline: "At-home metabolic panels with same-day results",
    category: "Health",
    description:
      "Nori is trying to make metabolic testing as easy as a grocery run. Success here means FDA clearance plus national retail distribution.",
    founder: "Priya Raman",
    listedAt: "2026-06-21T16:45:00.000Z",
    status: "open",
    yesPoolSol: 12.2,
    noPoolSol: 27.8,
    question: "Will Nori Health receive FDA 510(k) clearance by June 2028?",
  },
  {
    slug: "orbit-grid",
    name: "Orbit Grid",
    tagline: "Software-defined charging for apartment buildings",
    category: "Climate",
    description:
      "Orbit Grid turns existing electrical panels into a shared EV network. The market tracks whether they can sign 500 buildings without blowing unit economics.",
    founder: "Leo Mendes",
    listedAt: "2026-05-09T11:00:00.000Z",
    status: "open",
    yesPoolSol: 64.9,
    noPoolSol: 22.0,
    question: "Will Orbit Grid sign 500 buildings under contract by Dec 2027?",
  },
  {
    slug: "kite-studio",
    name: "Kite Studio",
    tagline: "Collaborative CAD for hardware teams",
    category: "Devtools",
    description:
      "Kite is Figma for mechanical engineers. Traders are split on whether incumbents will copy the workflow before Kite owns the category.",
    founder: "Elena Voss",
    listedAt: "2026-04-18T08:15:00.000Z",
    status: "open",
    yesPoolSol: 19.5,
    noPoolSol: 14.7,
    question: "Will Kite Studio exceed 10,000 weekly active seats by Dec 2027?",
  },
  {
    slug: "sable-commerce",
    name: "Sable",
    tagline: "Embedded storefronts for creator brands",
    category: "Consumer",
    description:
      "Sable lets creators sell without leaving the apps their audience already uses. This market already resolved after a strategic acquisition.",
    founder: "Chris Okonkwo",
    listedAt: "2025-11-02T12:00:00.000Z",
    status: "resolved_yes",
    yesPoolSol: 88.0,
    noPoolSol: 21.4,
    question: "Will Sable be acquired or IPO at a $100M+ valuation by 2026?",
  },
];

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
