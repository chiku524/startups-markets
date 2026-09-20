"use client";

import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#07110c]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-[#b8ff4f] font-serif text-lg font-semibold text-[#07110c]">
            s
          </span>
          <span className="font-serif text-xl tracking-tight text-white">
            startups<span className="text-[#b8ff4f]">.markets</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-white/70 md:flex">
          <Link href="/markets" className="hover:text-white">
            Markets
          </Link>
          <Link href="/list" className="hover:text-white">
            List a startup
          </Link>
          <Link href="/portfolio" className="hover:text-white">
            Portfolio
          </Link>
        </nav>
        <div className="wallet-button">
          <WalletMultiButton />
        </div>
      </div>
    </header>
  );
}
