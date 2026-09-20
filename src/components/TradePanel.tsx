"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useMemo, useState } from "react";
import { explorerTxUrl, MIN_DEPOSIT_SOL, SOLANA_NETWORK } from "@/lib/config";
import { formatSol, payoutPreview, sideLabel } from "@/lib/markets";
import { buildDepositMemo } from "@/lib/onchain";
import { DEVNET_GENESIS } from "@/lib/ids";
import { buildSolTransfer, depositLamports, sendAndConfirmTransfer } from "@/lib/solana";
import type { MarketSide, Position, StartupMarket } from "@/lib/types";

const POSITIONS_KEY = "startups.markets.positions";

function readPositions(): Position[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    return JSON.parse(localStorage.getItem(POSITIONS_KEY) ?? "[]") as Position[];
  } catch {
    return [];
  }
}

function writePositions(positions: Position[]) {
  localStorage.setItem(POSITIONS_KEY, JSON.stringify(positions));
}

export function TradePanel({
  market,
  onMarketChange,
}: {
  market: StartupMarket;
  onMarketChange: (market: StartupMarket) => void;
}) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected } = useWallet();
  const [side, setSide] = useState<MarketSide>("yes");
  const [amount, setAmount] = useState("0.1");
  const [status, setStatus] = useState<string | null>(null);
  const [lastTx, setLastTx] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const amountSol = Number(amount) || 0;
  const preview = useMemo(
    () => payoutPreview(market, side, amountSol),
    [market, side, amountSol],
  );

  async function submitDeposit() {
    if (!publicKey) {
      setStatus("Connect a Solana wallet to deposit.");
      return;
    }
    if (market.status !== "open") {
      setStatus("This market is resolved.");
      return;
    }
    setBusy(true);
    setLastTx(null);
    setStatus("Checking Devnet connection…");
    try {
      if (SOLANA_NETWORK === "devnet") {
        const genesis = await connection.getGenesisHash();
        if (genesis !== DEVNET_GENESIS) {
          throw new Error("This app is on Solana Devnet. Switch the RPC/wallet to Devnet and retry.");
        }
      }
      const lamports = depositLamports(amountSol);
      const transaction = await buildSolTransfer({
        from: publicKey,
        lamports,
        memo: buildDepositMemo(market.slug, side),
        connection,
      });
      setStatus("Confirm the deposit in your wallet…");
      const signature = await sendAndConfirmTransfer({
        transaction,
        connection,
        sendTransaction,
      });
      setStatus("Recording your on-chain position…");
      const response = await fetch(`/api/markets/${market.slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          txSignature: signature,
        }),
      });
      const payload = (await response.json()) as { market?: StartupMarket; error?: string };
      if (!response.ok || !payload.market) {
        throw new Error(payload.error ?? "Could not record deposit.");
      }
      const next: Position = {
        slug: market.slug,
        side,
        amountSol,
        txSignature: signature,
        createdAt: new Date().toISOString(),
      };
      writePositions([next, ...readPositions()]);
      onMarketChange(payload.market);
      setLastTx(signature);
      setStatus(`Deposited ${formatSol(amountSol)} on ${sideLabel(side)}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Deposit failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <aside className="rounded-2xl border border-white/10 bg-[#0c1a14] p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-white/45">Deposit crypto</p>
      <h2 className="mt-1 font-serif text-2xl text-white">Take a position</h2>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setSide("yes")}
          className={`rounded-xl px-3 py-3 text-sm font-semibold ${
            side === "yes"
              ? "bg-[#b8ff4f] text-[#07110c]"
              : "border border-white/10 text-white/70"
          }`}
        >
          YES
        </button>
        <button
          type="button"
          onClick={() => setSide("no")}
          className={`rounded-xl px-3 py-3 text-sm font-semibold ${
            side === "no"
              ? "bg-[#ff8b7b] text-[#2a0d0a]"
              : "border border-white/10 text-white/70"
          }`}
        >
          NO
        </button>
      </div>
      <label className="mt-4 block text-sm text-white/60">
        Amount (SOL)
        <input
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          type="number"
          min={MIN_DEPOSIT_SOL}
          step="0.01"
          className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-[#b8ff4f]"
        />
      </label>
      <p className="mt-3 text-sm text-white/55">
        If this side wins, {formatSol(amountSol)} could return about {formatSol(preview)} from the
        parimutuel pool.
      </p>
      <button
        type="button"
        disabled={busy || !connected}
        onClick={submitDeposit}
        className="mt-4 w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#07110c] disabled:opacity-50"
      >
        {connected ? `Deposit on ${sideLabel(side)}` : "Connect wallet to deposit"}
      </button>
      {status ? <p className="mt-3 text-sm text-[#b8ff4f]">{status}</p> : null}
      {lastTx ? (
        <a
          className="mt-2 inline-block text-xs text-white/55 underline"
          href={explorerTxUrl(lastTx)}
          target="_blank"
          rel="noreferrer"
        >
          View on Solana Explorer
        </a>
      ) : null}
      <p className="mt-4 text-xs leading-5 text-white/40">
        Deposits are SOL transfers to the platform treasury on Devnet. Pools are rebuilt from those
        confirmed transactions.
      </p>
    </aside>
  );
}
