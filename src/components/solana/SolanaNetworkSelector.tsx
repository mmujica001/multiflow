"use client";

import { useAppStore } from "@/stores/appStore";
import { useTranslation } from "react-i18next";

const NETWORKS = [
  { value: "mainnet" as const, label: "Solana Mainnet" },
  { value: "devnet" as const, label: "Solana Devnet" },
  { value: "testnet" as const, label: "Solana Testnet" },
];

export function SolanaNetworkSelector() {
  const { t } = useTranslation();
  const solanaNetwork = useAppStore((s) => s.solanaNetwork);
  const setSolanaNetwork = useAppStore((s) => s.setSolanaNetwork);

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-on-surface">
        {t("settings.solanaNetwork") || "Red Solana"}
      </h2>
      <div className="flex gap-2">
        {NETWORKS.map((net) => (
          <button
            key={net.value}
            onClick={() => setSolanaNetwork(net.value)}
            className={`flex-1 py-3 rounded-full text-sm font-semibold transition-all ${
              solanaNetwork === net.value
                ? "bg-primary text-on-primary shadow-sm"
                : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            {net.label}
          </button>
        ))}
      </div>
    </div>
  );
}
