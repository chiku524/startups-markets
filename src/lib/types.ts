export type MarketSide = "yes" | "no";

export type MarketStatus = "open" | "resolved_yes" | "resolved_no";

export type StartupMarket = {
  slug: string;
  name: string;
  tagline: string;
  category: string;
  description: string;
  website?: string;
  founder: string;
  listedAt: string;
  listingTx?: string;
  listedBy?: string;
  status: MarketStatus;
  yesPoolSol: number;
  noPoolSol: number;
  question: string;
};

export type Position = {
  slug: string;
  side: MarketSide;
  amountSol: number;
  txSignature: string;
  createdAt: string;
};

export type ListingPayload = {
  name: string;
  tagline: string;
  category: string;
  description: string;
  website?: string;
  founder: string;
  question: string;
  listingTx: string;
  listedBy: string;
  slug?: string;
};
