"use client";

import dynamic from "next/dynamic";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";
import { HtmlLangSync } from "@/components/i18n/HtmlLangSync";
import type { ReactNode } from "react";

const SolanaWalletProvider = dynamic(
  () =>
    import("@/contexts/WalletContext").then((mod) => mod.SolanaWalletProvider),
  { ssr: false }
);

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <SolanaWalletProvider>
          <HtmlLangSync />
          {children}
        </SolanaWalletProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
