"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function NewTransactionPage() {
  const { t } = useTranslation();
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.push("/");
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="w-full max-w-md min-h-screen bg-surface flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md min-h-screen bg-surface relative pb-32">
      <TopAppBar title={t("transactions.newTitle")} showBack backHref="/dashboard" />

      <main className="flex-1 px-5 pt-2 pb-8">
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/20">
          <TransactionForm
            onSuccess={() => router.push("/dashboard")}
          />
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
