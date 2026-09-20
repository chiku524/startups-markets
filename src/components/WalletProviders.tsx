"use client";

import { Buffer } from "buffer";
import { useEffect, useMemo, useState } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PUBLIC_CLUSTER_RPC } from "@/lib/config";

import "@solana/wallet-adapter-react-ui/styles.css";

if (typeof window !== "undefined") {
  window.Buffer = window.Buffer ?? Buffer;
}

export function WalletProviders({ children }: { children: React.ReactNode }) {
  const [endpoint, setEndpoint] = useState(PUBLIC_CLUSTER_RPC);
  const wallets = useMemo(() => [], []);

  useEffect(() => {
    setEndpoint(`${window.location.origin}/api/solana`);
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
