"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAppStore } from "@/stores/appStore";
import { createClient } from "@/lib/supabase";
import { getSolBalance } from "@/services/solana";
import { fetchSolPrice, fetchVesRate } from "@/services/exchangeRates";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { CategoryChart } from "@/components/dashboard/CategoryChart";
import { BudgetHealthCard } from "@/components/dashboard/BudgetHealthCard";
import { BudgetProgressList } from "@/components/dashboard/BudgetProgressList";
import { formatCurrency, convertAmount } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { Transaction, Category, Budget, UserCategory } from "@/types";

import { defaultCategories } from "@/lib/i18n/categories";

export default function DashboardPage() {
  const { t, i18n } = useTranslation();
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const {
    transactions,
    setTransactions,
    connectedWallet,
    setConnectedWallet,
    setSolPrice,
    setVesRate,
    solPrice,
    vesRate,
    preferences,
    budgets,
    setBudgets,
    userCategories,
    setUserCategories,
  } = useAppStore();
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);

  const loadData = useCallback(async () => {
    setIsDataLoading(true);

    const [solP, vesR] = await Promise.all([
      fetchSolPrice(),
      fetchVesRate(),
    ]);

    if (supabase && user) {
      const [txResult, catResult, budgetResult, userCatResult] = await Promise.all([
        supabase
          .from("transacciones")
          .select("*")
          .order("date", { ascending: false })
          .limit(50),
        supabase.from("categorias").select("*"),
        supabase
          .from("budgets")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("user_categories")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);
      if (txResult.data) setTransactions(txResult.data as unknown as Transaction[]);
      if (catResult.data && catResult.data.length > 0) setCategories(catResult.data);
      if (budgetResult.data) setBudgets(budgetResult.data as Budget[]);
      if (userCatResult.data) setUserCategories(userCatResult.data as UserCategory[]);
    }

    if (solP) setSolPrice(solP);
    if (vesR) setVesRate(vesR);

    if (connectedWallet?.address) {
      const network = useAppStore.getState().solanaNetwork;
      const balance = await getSolBalance(connectedWallet.address, network);
      setConnectedWallet({ ...connectedWallet, balance });
    }

    setIsDataLoading(false);
  }, [supabase, user, connectedWallet?.address, setTransactions, setCategories, setBudgets, setUserCategories, setSolPrice, setVesRate, setConnectedWallet]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/");
      return;
    }
    loadData();
  }, [user, authLoading, loadData, router]);

  if (authLoading || isDataLoading) {
    return (
      <div className="w-full max-w-md min-h-screen bg-surface flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalFiat = transactions
    .filter((t) => t.currency !== "SOL")
    .reduce((sum, t) => {
      return t.type === "income" ? sum + t.converted_usd : sum - t.converted_usd;
    }, 0);

  const totalCrypto = transactions
    .filter((t) => t.currency === "SOL")
    .reduce((sum, t) => {
      return t.type === "income" ? sum + t.converted_usd : sum - t.converted_usd;
    }, 0);

  const onChainValue = (connectedWallet?.balance || 0) * solPrice;
  const totalBalance = totalFiat + totalCrypto + onChainValue;

  const recentTransactions = transactions.slice(0, 5);

  const baseCurrency = preferences.base_currency;
  const currentPeriod = new Date().toISOString().slice(0, 7);

  const periodBudgets = budgets.filter((b) => b.period === currentPeriod);
  const totalBudgeted = periodBudgets.reduce((sum, b) => sum + b.amount, 0);
  const monthlyExpenses = transactions
    .filter((tx) => tx.type === "expense" && tx.date.startsWith(currentPeriod))
    .reduce((sum, tx) => sum + tx.converted_usd, 0);
  const totalBudgetSpent = monthlyExpenses;

  return (
    <div className="w-full max-w-md min-h-screen bg-surface relative pb-24">
      <TopAppBar title="MultiFlow" subtitle={user?.email || ""} />

      <main className="flex-1 px-5 pt-2 space-y-4 pb-8">
        <BalanceCard
          title={t("dashboard.totalBalance")}
          amount={convertAmount(
            totalBalance,
            "USD",
            baseCurrency,
            { SOL: solPrice, VES: vesRate }
          )}
          currency={baseCurrency}
        />

        <div className="grid grid-cols-2 gap-3">
          <BalanceCard
            title={t("dashboard.fiat")}
            amount={convertAmount(
              totalFiat,
              "USD",
              baseCurrency,
              { SOL: solPrice, VES: vesRate }
            )}
            currency={baseCurrency}
            usdValue={totalFiat}
          />
          <BalanceCard
            title={t("dashboard.solana")}
            amount={connectedWallet?.balance || 0}
            currency="SOL"
            usdValue={onChainValue}
            isCrypto
            subtitle={
              connectedWallet?.address
                ? `${connectedWallet.address.slice(0, 4)}...${connectedWallet.address.slice(-4)}`
                : undefined
            }
          />
        </div>

        {periodBudgets.length > 0 && (
          <BudgetHealthCard
            totalBudgeted={totalBudgeted}
            totalSpent={totalBudgetSpent}
          />
        )}

        <CategoryChart
          transactions={transactions}
          categories={categories}
        />

        {periodBudgets.length > 0 && (
          <BudgetProgressList
            budgets={periodBudgets}
            transactions={transactions}
            categories={categories}
            userCategories={userCategories}
            period={currentPeriod}
          />
        )}

        <section>
          <h2 className="text-base font-semibold text-on-surface mb-3">
            {t("dashboard.recentMovements")}
          </h2>
          {recentTransactions.length === 0 ? (
            <p className="text-sm text-on-surface-variant text-center py-6">
              {t("dashboard.noMovements")}
            </p>
          ) : (
            <div className="space-y-2">
              {recentTransactions.map((tx) => {
                const cat = categories.find(
                  (c) => c.id === tx.category_id
                );
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/20 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          tx.type === "income"
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        <span className="material-symbols-outlined text-xl">
                          {cat?.icon || "receipt"}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-on-surface">
                          {tx.description}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {new Date(tx.date).toLocaleDateString(i18n.language === "en" ? "en-US" : i18n.language === "fr" ? "fr-FR" : "es-ES", {
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`text-sm font-bold ${
                        tx.type === "income"
                          ? "text-emerald-600"
                          : "text-on-surface"
                      }`}
                    >
                      {tx.type === "income" ? "+" : "-"}
                      {formatCurrency(tx.amount, tx.currency)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
