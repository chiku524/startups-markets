"use client";

import Link from "next/link";
import { MarketCard } from "@/components/MarketCard";
import { useMarkets } from "@/components/useMarkets";
import { LISTING_FEE_SOL } from "@/lib/config";
import { formatSol } from "@/lib/markets";

export default function HomePage() {
  const { markets } = useMarkets();
  const featured = markets.filter((market) => market.status === "open").slice(0, 4);
  const volume = markets.reduce((sum, market) => sum + market.yesPoolSol + market.noPoolSol, 0);

  return (
    <div>
      <section className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:py-24">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[#b8ff4f]">Prediction markets for founders</p>
          <h1 className="mt-4 max-w-xl font-serif text-5xl leading-[1.05] text-white sm:text-6xl">
            Price the chance a startup actually makes it.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-white/70">
            startups.markets lets anyone deposit SOL on whether a listed company becomes successful.
            Founders open a market by paying a {LISTING_FEE_SOL} SOL listing fee.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/markets"
              className="rounded-full bg-[#b8ff4f] px-5 py-3 text-sm font-semibold text-[#07110c]"
            >
              Browse markets
            </Link>
            <Link
              href="/list"
              className="rounded-full border border-white/15 px-5 py-3 text-sm text-white"
            >
              List a startup · {LISTING_FEE_SOL} SOL
            </Link>
          </div>
        </div>
        <div className="grid gap-4 self-start rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <Stat label="Open interest" value={formatSol(volume)} />
          <Stat label="Live companies" value={String(markets.length)} />
          <Stat label="Listing fee" value={`${LISTING_FEE_SOL} SOL`} />
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-serif text-3xl">Live markets</h2>
          <Link href="/markets" className="text-sm text-[#b8ff4f]">
            View all
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {featured.map((market) => (
            <MarketCard key={market.slug} market={market} />
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-black/20 px-4 py-5">
      <p className="text-xs uppercase tracking-[0.18em] text-white/40">{label}</p>
      <p className="mt-2 font-serif text-3xl text-white">{value}</p>
    </div>
  );
}
