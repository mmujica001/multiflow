"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAppStore } from "@/stores/appStore";
import { createClient } from "@/lib/supabase";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { SolanaNetworkSelector } from "@/components/solana/SolanaNetworkSelector";
import { WalletButton, WalletDisconnectButton } from "@/contexts/WalletContext";
import { getSolBalance } from "@/services/solana";
import { shortenAddress, formatCurrency } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { Loader2, Wallet, Trash2, Copy, Check } from "lucide-react";
import type { Currency, Wallet as WalletType } from "@/types";

const NETWORK_LABELS: Record<string, { label: string; color: string }> = {
  mainnet: { label: "Mainnet", color: "bg-emerald-100 text-emerald-700" },
  devnet: { label: "Devnet", color: "bg-amber-100 text-amber-700" },
  testnet: { label: "Testnet", color: "bg-red-100 text-red-700" },
};

export default function SettingsPage() {
  const { t } = useTranslation();
  const { user, isLoading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const connectedWallet = useAppStore((s) => s.connectedWallet);
  const solanaNetwork = useAppStore((s) => s.solanaNetwork);
  const { wallets, setWallets, preferences, setPreferences, setConnectedWallet } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const publicKeyStr = connectedWallet?.address || null;

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/");
      return;
    }
    loadWallets();
  }, [user, authLoading]);

  const fetchBalance = useCallback(async () => {
    if (!connectedWallet?.address) return;
    setBalanceLoading(true);
    const balance = await getSolBalance(connectedWallet.address, solanaNetwork);
    setConnectedWallet({ ...connectedWallet, balance });
    setBalanceLoading(false);
  }, [connectedWallet?.address, solanaNetwork, setConnectedWallet]);

  useEffect(() => {
    if (connectedWallet?.address) fetchBalance();
  }, [connectedWallet?.address, solanaNetwork, fetchBalance]);

  async function loadWallets() {
    if (supabase) {
      const { data } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user!.id);
      if (data) setWallets(data as unknown as WalletType[]);
    }
    setIsLoading(false);
  }

  const handleLinkWallet = async () => {
    if (!publicKeyStr || !user || !supabase) return;
    const address = publicKeyStr;

    const { error } = await supabase.from("wallets").insert({
      user_id: user.id,
      address,
      blockchain: "solana",
      nickname: `Wallet ${wallets.length + 1}`,
    } as any);

    if (!error) {
      loadWallets();
    }
  };

  const handleUnlinkWallet = async (id: string) => {
    if (!supabase) return;
    const { error } = await supabase.from("wallets").delete().eq("id", id);
    if (!error) loadWallets();
  };

  const handleCurrencyChange = (currency: Currency) => {
    setPreferences({ base_currency: currency });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const copyAddress = () => {
    if (publicKeyStr) {
      navigator.clipboard.writeText(publicKeyStr);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="w-full max-w-md min-h-screen bg-surface flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const networkInfo = NETWORK_LABELS[solanaNetwork] || NETWORK_LABELS.mainnet;

  return (
    <div className="w-full max-w-md min-h-screen bg-surface relative pb-24">
      <TopAppBar title={t("settings.title")} />

      <main className="flex-1 px-5 pt-2 space-y-4 pb-8">
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/20 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-2xl">person</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-on-surface">{user?.email || t("settings.user")}</p>
              <p className="text-xs text-on-surface-variant">{t("settings.connected")}</p>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/20 space-y-4">
          <h2 className="text-sm font-semibold text-on-surface">{t("settings.baseCurrency")}</h2>
          <div className="flex gap-2">
            {(["USD", "VES", "SOL"] as Currency[]).map((cur) => (
              <button
                key={cur}
                onClick={() => handleCurrencyChange(cur)}
                className={`flex-1 py-3 rounded-full text-sm font-semibold transition-all ${
                  preferences.base_currency === cur
                    ? "bg-primary text-on-primary shadow-sm"
                    : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                {cur}
              </button>
            ))}
          </div>
          {saved && (
            <p className="text-xs text-emerald-600 text-center">
              {t("settings.preferenceSaved")}
            </p>
          )}
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/20 space-y-4">
          <h2 className="text-sm font-semibold text-on-surface">
            {t("settings.linkedWallets")}
          </h2>

          {wallets.length > 0 && (
            <div className="space-y-2">
              {wallets.map((w) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between bg-surface-container rounded-xl px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center">
                      <Wallet className="w-4 h-4 text-on-primary-container" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-on-surface">
                        {w.nickname}
                      </p>
                      <p className="text-xs text-on-surface-variant font-mono">
                        {shortenAddress(w.address)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnlinkWallet(w.id)}
                    className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-error transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {publicKeyStr ? (
            <div className="bg-gradient-to-br from-primary/5 to-primary-container/10 rounded-xl p-4 border border-primary/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-secondary-container" />
                  <span className="text-sm font-semibold text-on-surface">
                    {t("wallet.connected") || "Wallet conectada"}
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${networkInfo.color}`}>
                  {networkInfo.label}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  {balanceLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span className="text-xs text-on-surface-variant">Cargando balance...</span>
                    </div>
                  ) : (
                    <p className="text-xl font-bold text-on-surface">
                      {formatCurrency(connectedWallet?.balance || 0, "SOL")}
                    </p>
                  )}
                </div>
                <button
                  onClick={fetchBalance}
                  className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
                  title="Refrescar balance"
                >
                  <span className="material-symbols-outlined text-lg">refresh</span>
                </button>
              </div>

              <div className="flex items-center justify-between bg-surface-container/50 rounded-lg px-3 py-2">
                <span className="text-xs font-mono text-on-surface-variant truncate max-w-[200px]">
                  {shortenAddress(publicKeyStr)}
                </span>
                <button
                  onClick={copyAddress}
                  className="ml-2 flex-shrink-0"
                  title="Copiar dirección"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-on-surface-variant hover:text-on-surface transition-colors" />
                  )}
                </button>
              </div>

              {!wallets.find((w) => w.address === publicKeyStr) && (
                <button
                  onClick={handleLinkWallet}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary rounded-full py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
                >
                  <Wallet className="w-4 h-4" />
                  {t("settings.link", { address: shortenAddress(publicKeyStr) })}
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-on-surface-variant text-center">
                {t("settings.connectWallet")}
              </p>
              <WalletButton />
            </div>
          )}
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/20">
          <SolanaNetworkSelector />
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/20 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-on-surface">{t("settings.language")}</h2>
            <LanguageSwitcher />
          </div>
        </div>

        {publicKeyStr && (
          <WalletDisconnectButton onDisconnected={signOut} />
        )}
      </main>

      <BottomNav />
    </div>
  );
}
