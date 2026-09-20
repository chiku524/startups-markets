"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { LISTING_FEE_SOL, hasTreasuryConfigured } from "@/lib/config";
import { buildSolTransfer, listingFeeLamports } from "@/lib/solana";
import type { StartupMarket } from "@/lib/types";

const LOCAL_LISTINGS_KEY = "startups.markets.listings";

function saveLocalListing(market: StartupMarket) {
  try {
    const current = JSON.parse(localStorage.getItem(LOCAL_LISTINGS_KEY) ?? "[]") as StartupMarket[];
    localStorage.setItem(LOCAL_LISTINGS_KEY, JSON.stringify([market, ...current]));
  } catch {
    localStorage.setItem(LOCAL_LISTINGS_KEY, JSON.stringify([market]));
  }
}

export function ListStartupForm() {
  const router = useRouter();
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected } = useWallet();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    tagline: "",
    category: "AI",
    founder: "",
    website: "",
    question: "",
    description: "",
  });

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!hasTreasuryConfigured()) {
      setStatus("Set NEXT_PUBLIC_TREASURY_ADDRESS before listings can be paid on-chain.");
      return;
    }
    if (!publicKey) {
      setStatus("Connect a Solana wallet to pay the 0.1 SOL listing fee.");
      return;
    }
    setBusy(true);
    setStatus("Confirm 0.1 SOL listing fee in your wallet…");
    try {
      const transaction = await buildSolTransfer({
        from: publicKey,
        lamports: listingFeeLamports(),
      });
      const listingTx = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(listingTx, "confirmed");
      setStatus("Verifying the listing payment on Solana…");
      const response = await fetch("/api/markets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          listingTx,
          listedBy: publicKey.toBase58(),
        }),
      });
      const payload = (await response.json()) as { market?: StartupMarket; error?: string };
      if (!response.ok || !payload.market) {
        throw new Error(payload.error ?? "Listing verification failed.");
      }
      saveLocalListing(payload.market);
      setStatus("Listed. Opening your market…");
      router.push(`/markets/${payload.market.slug}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Listing failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Company name" value={form.name} onChange={(value) => update("name", value)} required />
        <Field label="Founder" value={form.founder} onChange={(value) => update("founder", value)} required />
      </div>
      <Field label="Tagline" value={form.tagline} onChange={(value) => update("tagline", value)} required />
      <label className="block text-sm text-white/60">
        Category
        <select
          value={form.category}
          onChange={(event) => update("category", event.target.value)}
          className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-[#b8ff4f]"
        >
          {["AI", "Fintech", "Health", "Climate", "Devtools", "Consumer", "Other"].map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>
      <Field
        label="Website"
        value={form.website}
        onChange={(value) => update("website", value)}
        placeholder="https://"
      />
      <Field
        label="Market question"
        value={form.question}
        onChange={(value) => update("question", value)}
        placeholder="Will this company raise a Series A by 2028?"
        required
      />
      <label className="block text-sm text-white/60">
        Why this company might succeed
        <textarea
          required
          rows={5}
          value={form.description}
          onChange={(event) => update("description", event.target.value)}
          className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-[#b8ff4f]"
        />
      </label>
      <button
        type="submit"
        disabled={busy || !connected}
        className="w-full rounded-xl bg-[#b8ff4f] px-4 py-3 text-sm font-semibold text-[#07110c] disabled:opacity-50"
      >
        {connected ? `List company for ${LISTING_FEE_SOL} SOL` : "Connect wallet to list"}
      </button>
      {status ? <p className="text-sm text-[#b8ff4f]">{status}</p> : null}
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm text-white/60">
      {label}
      <input
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-[#b8ff4f]"
      />
    </label>
  );
}
