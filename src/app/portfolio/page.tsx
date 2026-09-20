"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useMarkets } from "@/components/useMarkets";
import { explorerTxUrl } from "@/lib/config";
import { formatSol, sideLabel } from "@/lib/markets";
import type { Position } from "@/lib/types";

export default function PortfolioPage() {
  const { markets } = useMarkets();
  const [positions, setPositions] = useState<Position[]>([]);

  useEffect(() => {
    try {
      setPositions(JSON.parse(localStorage.getItem("startups.markets.positions") ?? "[]") as Position[]);
    } catch {
      setPositions([]);
    }
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="font-serif text-4xl">Portfolio</h1>
      <p className="mt-3 text-white/65">
        Positions from this browser after a confirmed Devnet deposit.
      </p>
      {positions.length === 0 ? (
        <p className="mt-8 text-white/50">No deposits yet.</p>
      ) : (
        <div className="mt-8 space-y-3">
          {positions.map((position) => {
            const market = markets.find((item) => item.slug === position.slug);
            return (
              <Link
                key={position.txSignature}
                href={`/markets/${position.slug}`}
                className="block rounded-2xl border border-white/10 p-4 hover:border-[#b8ff4f]/40"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-serif text-xl">{market?.name ?? position.slug}</p>
                    <p className="text-sm text-white/50">
                      {sideLabel(position.side)} · {formatSol(position.amountSol)}
                    </p>
                  </div>
                  <a
                    className="text-xs text-white/35 underline"
                    href={explorerTxUrl(position.txSignature)}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {position.txSignature.slice(0, 8)}…
                  </a>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
