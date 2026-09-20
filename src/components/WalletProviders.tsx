"use client";

import { Buffer } from "buffer";
import { useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { SOLANA_RPC } from "@/lib/config";

import "@solana/wallet-adapter-react-ui/styles.css";

if (typeof window !== "undefined") {
  window.Buffer = window.Buffer ?? Buffer;
}

export function WalletProviders({ children }: { children: React.ReactNode }) {
  const endpoint = useMemo(() => SOLANA_RPC, []);
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
