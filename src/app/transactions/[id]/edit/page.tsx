"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { useAppStore } from "@/stores/appStore";
import { useTranslation } from "react-i18next";
import { useRouter, useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function EditTransactionPage() {
  const { t } = useTranslation();
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const transaction = useAppStore((s) =>
    s.transactions.find((tx) => tx.id === id)
  );

  useEffect(() => {
    if (!authLoading && !user) router.push("/");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!authLoading && transaction === undefined) {
      router.push("/transactions");
    }
  }, [authLoading, transaction, router]);

  if (authLoading) {
    return (
      <div className="w-full max-w-md min-h-screen bg-surface flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!transaction) return null;

  return (
    <div className="w-full max-w-md min-h-screen bg-surface relative pb-32">
      <TopAppBar title={t("transactions.editTitle")} showBack backHref="/dashboard" />

      <main className="flex-1 px-5 pt-2 pb-8">
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/20">
          <TransactionForm
            onSuccess={() => router.push("/dashboard")}
            editTransaction={{
              id: transaction.id,
              type: transaction.type,
              amount: transaction.amount,
              currency: transaction.currency,
              category_id: transaction.category_id,
              description: transaction.description,
              date: transaction.date,
              image_url: transaction.image_url,
            }}
          />
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
