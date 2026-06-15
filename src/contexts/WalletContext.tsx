"use client";

import "@solana/wallet-adapter-react-ui/styles.css";

import { useMemo, type ReactNode, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LogOut } from "lucide-react";
import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { WalletNotReadyError, type WalletError } from "@solana/wallet-adapter-base";
import { useAppStore } from "@/stores/appStore";

const RPC_URLS: Record<string, string> = {
  mainnet:
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com",
  devnet: "https://api.devnet.solana.com",
  testnet: "https://api.testnet.solana.com",
};

function onWalletError(error: WalletError) {
  if (error instanceof WalletNotReadyError) return;
  console.error(error);
}

export function SolanaWalletProvider({ children }: { children: ReactNode }) {
  const solanaNetwork = useAppStore((s) => s.solanaNetwork);
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()] as any[],
    []
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) {
    return <>{children}</>;
  }

  const endpoint = RPC_URLS[solanaNetwork] || RPC_URLS.mainnet;

  try {
    return (
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect onError={onWalletError}>
          <WalletModalProvider>
            <WalletStateSync />
            {children}
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    );
  } catch {
    return <>{children}</>;
  }
}

function WalletStateSync() {
  const { publicKey } = useWallet();
  const setConnectedWallet = useAppStore((s) => s.setConnectedWallet);

  useEffect(() => {
    if (publicKey) {
      setConnectedWallet({ address: publicKey.toBase58(), balance: 0 });
    } else {
      setConnectedWallet(null);
    }
  }, [publicKey, setConnectedWallet]);

  return null;
}

export function WalletButton() {
  const { t } = useTranslation();
  const [safeReady, setSafeReady] = useState(false);

  useEffect(() => {
    setSafeReady(true);
  }, []);

  if (!safeReady) {
    return (
      <div className="flex justify-center w-full">
        <div className="w-full bg-primary/50 text-on-primary rounded-full py-3 px-6 text-sm font-semibold text-center animate-pulse">
          {t("wallet.connecting")}
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="flex justify-center w-full">
        <WalletMultiButton />
      </div>
    );
  } catch {
    return (
      <div className="flex justify-center w-full">
        <div className="w-full bg-surface-container-high text-on-surface-variant rounded-full py-3 px-6 text-sm font-semibold text-center">
          {t("wallet.notAvailable")}
        </div>
      </div>
    );
  }
}

export function WalletDisconnectButton({ onDisconnected }: { onDisconnected?: () => void }) {
  const { t } = useTranslation();
  const wallet = useWallet();

  return (
    <button
      onClick={async () => {
        try {
          await wallet.disconnect();
        } catch {}
        onDisconnected?.();
      }}
      className="w-full flex items-center justify-center gap-2 bg-error-container text-on-error-container rounded-full py-3 text-sm font-semibold hover:bg-error-container/80 transition-colors"
    >
      <LogOut className="w-4 h-4" />
      {t("wallet.disconnect")}
    </button>
  );
}

export { useWallet };
