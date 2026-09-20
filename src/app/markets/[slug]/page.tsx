"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { explorerTxUrl } from "@/lib/config";
import { TradePanel } from "@/components/TradePanel";
import { useMarkets } from "@/components/useMarkets";
import { formatPercent, formatSol, impliedProbability, statusLabel } from "@/lib/markets";
import type { StartupMarket } from "@/lib/types";

export default function MarketDetailPage() {
  const params = useParams<{ slug: string }>();
  const { markets, loading } = useMarkets();
  const [market, setMarket] = useState<StartupMarket | null>(null);

  useEffect(() => {
    const match = markets.find((item) => item.slug === params.slug);
    if (match) {
      setMarket(match);
    }
  }, [markets, params.slug]);

  if (loading && !market) {
    return <p className="px-6 py-16 text-white/50">Loading market…</p>;
  }

  if (!market) {
    return (
      <div className="px-6 py-16">
        <p className="text-white/70">Market not found.</p>
        <Link href="/markets" className="mt-4 inline-block text-[#b8ff4f]">
          Back to markets
        </Link>
      </div>
    );
  }

  const yes = impliedProbability(market);

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.15fr_0.85fr]">
      <article>
        <p className="text-xs uppercase tracking-[0.2em] text-[#b8ff4f]">{market.category}</p>
        <h1 className="mt-2 font-serif text-5xl text-white">{market.name}</h1>
        <p className="mt-3 text-lg text-white/70">{market.tagline}</p>
        <div className="mt-6 rounded-2xl border border-white/10 p-5">
          <p className="text-sm text-white/45">Question</p>
          <p className="mt-2 font-serif text-2xl leading-snug">{market.question}</p>
          <div className="mt-5">
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-[#b8ff4f]">{formatPercent(yes)} YES</span>
              <span className="text-[#ff8b7b]">{formatPercent(1 - yes)} NO</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#ff8b7b]/30">
              <div className="h-full bg-[#b8ff4f]" style={{ width: `${yes * 100}%` }} />
            </div>
          </div>
          <p className="mt-4 text-sm text-white/50">
            {statusLabel(market.status)} · volume {formatSol(market.yesPoolSol + market.noPoolSol)}
          </p>
        </div>
        <p className="mt-6 max-w-2xl leading-7 text-white/70">{market.description}</p>
        <dl className="mt-8 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-white/40">Founder</dt>
            <dd className="mt-1">{market.founder}</dd>
          </div>
          <div>
            <dt className="text-white/40">Listed</dt>
            <dd className="mt-1">{new Date(market.listedAt).toLocaleDateString()}</dd>
          </div>
          {market.listingTx ? (
            <div className="sm:col-span-2">
              <dt className="text-white/40">Listing transaction</dt>
              <dd className="mt-1">
                <a
                  className="break-all text-[#b8ff4f] underline"
                  href={explorerTxUrl(market.listingTx)}
                  target="_blank"
                  rel="noreferrer"
                >
                  {market.listingTx}
                </a>
              </dd>
            </div>
          ) : null}
        </dl>
      </article>
      <TradePanel market={market} onMarketChange={setMarket} />
    </div>
  );
}
