import { create } from "zustand";
import type { Currency, Transaction, Wallet, UserPreferences, Budget, UserCategory } from "@/types";

interface AppState {
  user: {
    id: string;
    email: string | null;
  } | null;
  preferences: UserPreferences;
  transactions: Transaction[];
  wallets: Wallet[];
  connectedWallet: { address: string; balance: number } | null;
  solPrice: number;
  vesRate: number;
  solanaNetwork: "mainnet" | "devnet" | "testnet";
  budgets: Budget[];
  userCategories: UserCategory[];

  setUser: (user: AppState["user"]) => void;
  setPreferences: (prefs: Partial<UserPreferences>) => void;
  setTransactions: (txs: Transaction[]) => void;
  addTransaction: (tx: Transaction) => void;
  updateTransaction: (id: string, tx: Partial<Transaction>) => void;
  removeTransaction: (id: string) => void;
  setWallets: (wallets: Wallet[]) => void;
  addWallet: (wallet: Wallet) => void;
  setConnectedWallet: (wallet: AppState["connectedWallet"]) => void;
  setSolPrice: (price: number) => void;
  setVesRate: (rate: number) => void;
  setSolanaNetwork: (network: AppState["solanaNetwork"]) => void;
  setBudgets: (budgets: Budget[]) => void;
  addBudget: (budget: Budget) => void;
  updateBudget: (id: string, budget: Partial<Budget>) => void;
  removeBudget: (id: string) => void;
  setUserCategories: (categories: UserCategory[]) => void;
  addUserCategory: (category: UserCategory) => void;
  updateUserCategory: (id: string, category: Partial<UserCategory>) => void;
  removeUserCategory: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  preferences: { base_currency: "USD", theme: "light" },
  transactions: [],
  wallets: [],
  connectedWallet: null,
  solPrice: 0,
  vesRate: 0,
  solanaNetwork: "mainnet",
  budgets: [],
  userCategories: [],

  setUser: (user) => set({ user }),
  setPreferences: (prefs) =>
    set((state) => ({
      preferences: { ...state.preferences, ...prefs },
    })),
  setTransactions: (transactions) => set({ transactions }),
  addTransaction: (tx) =>
    set((state) => ({ transactions: [tx, ...state.transactions] })),
  updateTransaction: (id, tx) =>
    set((state) => ({
      transactions: state.transactions.map((t) =>
        t.id === id ? { ...t, ...tx } : t
      ),
    })),
  removeTransaction: (id) =>
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    })),
  setWallets: (wallets) => set({ wallets }),
  addWallet: (wallet) =>
    set((state) => ({ wallets: [...state.wallets, wallet] })),
  setConnectedWallet: (wallet) => set({ connectedWallet: wallet }),
  setSolPrice: (solPrice) => set({ solPrice }),
  setVesRate: (vesRate) => set({ vesRate }),
  setSolanaNetwork: (solanaNetwork) => set({ solanaNetwork }),
  setBudgets: (budgets) => set({ budgets }),
  addBudget: (budget) =>
    set((state) => ({ budgets: [budget, ...state.budgets] })),
  updateBudget: (id, budget) =>
    set((state) => ({
      budgets: state.budgets.map((b) =>
        b.id === id ? { ...b, ...budget } : b
      ),
    })),
  removeBudget: (id) =>
    set((state) => ({
      budgets: state.budgets.filter((b) => b.id !== id),
    })),
  setUserCategories: (userCategories) => set({ userCategories }),
  addUserCategory: (category) =>
    set((state) => ({ userCategories: [category, ...state.userCategories] })),
  updateUserCategory: (id, category) =>
    set((state) => ({
      userCategories: state.userCategories.map((c) =>
        c.id === id ? { ...c, ...category } : c
      ),
    })),
  removeUserCategory: (id) =>
    set((state) => ({
      userCategories: state.userCategories.filter((c) => c.id !== id),
    })),
}));
