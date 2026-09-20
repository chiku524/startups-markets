import Link from "next/link";
import { formatPercent, formatSol, impliedProbability, statusLabel } from "@/lib/markets";
import type { StartupMarket } from "@/lib/types";

export function MarketCard({ market }: { market: StartupMarket }) {
  const yes = impliedProbability(market);
  return (
    <Link
      href={`/markets/${market.slug}`}
      className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-[#b8ff4f]/40 hover:bg-white/[0.05]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[#b8ff4f]/80">{market.category}</p>
          <h3 className="mt-1 font-serif text-2xl text-white group-hover:text-[#b8ff4f]">
            {market.name}
          </h3>
        </div>
        <span className="rounded-full border border-white/15 px-2.5 py-1 text-xs text-white/60">
          {statusLabel(market.status)}
        </span>
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/65">{market.question}</p>
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-[#b8ff4f]">{formatPercent(yes)} YES</span>
          <span className="text-[#ff8b7b]">{formatPercent(1 - yes)} NO</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[#ff8b7b]/30">
          <div className="h-full bg-[#b8ff4f]" style={{ width: `${yes * 100}%` }} />
        </div>
      </div>
      <p className="mt-4 text-xs text-white/45">Volume {formatSol(market.yesPoolSol + market.noPoolSol)}</p>
    </Link>
  );
}
