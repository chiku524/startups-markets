"use client";

import { useEffect, useState } from "react";
import type { StartupMarket } from "@/lib/types";

export function useMarkets() {
  const [markets, setMarkets] = useState<StartupMarket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch("/api/markets", { cache: "no-store" });
        const payload = (await response.json()) as { markets?: StartupMarket[] };
        if (!cancelled) {
          setMarkets(payload.markets ?? []);
        }
      } catch {
        if (!cancelled) {
          setMarkets([]);
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
