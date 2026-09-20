import { ListStartupForm } from "@/components/ListStartupForm";
import { LISTING_FEE_SOL } from "@/lib/config";

export default function ListPage() {
  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[#b8ff4f]">Open a market</p>
        <h1 className="mt-3 font-serif text-4xl">List your startup for {LISTING_FEE_SOL} SOL</h1>
        <p className="mt-4 leading-7 text-white/65">
          Paying the listing fee publishes a YES/NO market on whether your company becomes
          successful. Traders then deposit SOL into the pool. If the market resolves in their
          favor, they split the opposing side.
        </p>
        <ul className="mt-6 space-y-2 text-sm text-white/70">
          <li>Connect a Solana wallet.</li>
          <li>Send {LISTING_FEE_SOL} SOL to the startups.markets treasury.</li>
          <li>Your company appears as a live prediction market.</li>
        </ul>
      </div>
      <ListStartupForm />
    </div>
  );
}
