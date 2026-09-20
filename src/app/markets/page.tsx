"use client";

import { MarketCard } from "@/components/MarketCard";
import { useMarkets } from "@/components/useMarkets";

export default function MarketsPage() {
  const { markets, loading } = useMarkets();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-serif text-4xl">All startup markets</h1>
      <p className="mt-3 max-w-2xl text-white/65">
        Each listing is a parimutuel market. Deposit SOL on YES if you think the company will hit
        its success condition, or NO if you think it will not.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {loading && markets.length === 0 ? (
          <p className="text-white/50">Loading markets…</p>
        ) : (
          markets.map((market) => <MarketCard key={market.slug} market={market} />)
        )}
      </div>
    </div>
  );
}
