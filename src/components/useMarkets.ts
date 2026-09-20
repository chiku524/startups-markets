"use client";

import { useEffect, useState } from "react";
import { SEED_MARKETS } from "@/lib/markets";
import type { StartupMarket } from "@/lib/types";

const LOCAL_LISTINGS_KEY = "startups.markets.listings";

export function useMarkets() {
  const [markets, setMarkets] = useState<StartupMarket[]>(SEED_MARKETS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch("/api/markets");
        const payload = (await response.json()) as { markets?: StartupMarket[] };
        const local = JSON.parse(localStorage.getItem(LOCAL_LISTINGS_KEY) ?? "[]") as StartupMarket[];
        const remote = payload.markets ?? SEED_MARKETS;
        const merged = [...local, ...remote].filter(
          (market, index, all) => all.findIndex((item) => item.slug === market.slug) === index,
        );
        if (!cancelled) {
          setMarkets(merged);
        }
      } catch {
        if (!cancelled) {
          setMarkets(SEED_MARKETS);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { markets, loading };
}
