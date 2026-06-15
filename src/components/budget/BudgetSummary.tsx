"use client";

import { useTranslation } from "react-i18next";
import type { Budget, Transaction, Category, UserCategory } from "@/types";
import { getTranslatedCategoryName } from "@/lib/i18n/categories";
import { BudgetCard } from "./BudgetCard";

interface BudgetSummaryProps {
  budgets: Budget[];
  transactions: Transaction[];
  categories: Category[];
  userCategories: UserCategory[];
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
}

export function BudgetSummary({
  budgets,
  transactions,
  categories,
  userCategories,
  onEdit,
  onDelete,
}: BudgetSummaryProps) {
  const { t } = useTranslation();
  const currentPeriod = new Date().toISOString().slice(0, 7);

  const periodBudgets = budgets.filter((b) => b.period === currentPeriod);

  const spentByCategory = transactions
    .filter((t) => t.type === "expense")
    .reduce<Record<string, number>>((acc, t) => {
      const txDate = t.date.slice(0, 7);
      if (txDate === currentPeriod) {
        acc[t.category_id] = (acc[t.category_id] || 0) + t.converted_usd;
      }
      return acc;
    }, {});

  const allCats = [
    ...categories,
    ...userCategories.map((uc) => ({
      id: uc.id,
      name: uc.name,
      icon: uc.icon,
      color: uc.color || undefined,
    })),
  ];

  if (periodBudgets.length === 0) {
    return (
      <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/20 text-center">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-3">
          account_balance
        </span>
        <p className="text-sm text-on-surface-variant">
          {t("budget.noBudgets")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {periodBudgets.map((budget) => {
        const spent = spentByCategory[budget.category_id] || 0;
        const cat = allCats.find((c) => c.id === budget.category_id);
        return (
          <BudgetCard
            key={budget.id}
            budget={budget}
            spent={spent}
            categoryName={
              cat
                ? getTranslatedCategoryName(cat.id, cat.name, t)
                : t("chart.noCategory")
            }
            categoryIcon={cat?.icon || "help"}
            onEdit={() => onEdit(budget)}
            onDelete={() => onDelete(budget.id)}
          />
        );
      })}
    </div>
  );
}
