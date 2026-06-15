"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAppStore } from "@/stores/appStore";
import { createClient } from "@/lib/supabase";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { TransactionList } from "@/components/transactions/TransactionList";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { Transaction } from "@/types";

export default function TransactionsPage() {
  const { t } = useTranslation();
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const { transactions, setTransactions } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/");
      return;
    }
    loadTransactions();
  }, [user, authLoading]);

  async function loadTransactions() {
    if (supabase) {
      const { data } = await supabase
        .from("transacciones")
        .select("*")
        .order("date", { ascending: false })
        .limit(100);
      if (data) setTransactions(data as unknown as Transaction[]);
    }
    setIsLoading(false);
  }

  if (authLoading || isLoading) {
    return (
      <div className="w-full max-w-md min-h-screen bg-surface flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md min-h-screen bg-surface relative pb-24">
      <TopAppBar title={t("transactions.title")} />

      <main className="flex-1 px-5 pt-2 space-y-4 pb-8">
        <TransactionList transactions={transactions} />
      </main>

      <BottomNav />
    </div>
  );
}
