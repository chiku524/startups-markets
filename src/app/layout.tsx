import type { Metadata } from "next";
import { Fraunces, Geist } from "next/font/google";
import { Header } from "@/components/Header";
import { WalletProviders } from "@/components/WalletProviders";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "startups.markets",
  description:
    "A prediction market for startup companies. List a company for 0.1 SOL, then deposit crypto on whether it becomes successful.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#07110c] font-sans text-white">
        <WalletProviders>
          <Header />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-white/10 px-4 py-8 text-center text-sm text-white/40">
            startups.markets — prediction markets for company outcomes. Listing fee 0.1 SOL.
          </footer>
        </WalletProviders>
      </body>
    </html>
  );
}
