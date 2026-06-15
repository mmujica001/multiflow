"use client";

import { useTranslation } from "react-i18next";
import { getTranslatedCategoryName } from "@/lib/i18n/categories";
import type { Budget, Category, Transaction, UserCategory } from "@/types";

interface BudgetProgressListProps {
  budgets: Budget[];
  transactions: Transaction[];
  categories: Category[];
  userCategories: UserCategory[];
  period: string;
}

export function BudgetProgressList({
  budgets,
  transactions,
  categories,
  userCategories,
  period,
}: BudgetProgressListProps) {
  const { t } = useTranslation();

  const periodBudgets = budgets.filter((b) => b.period === period);

  const spentByCategory = transactions
    .filter((tx) => tx.type === "expense" && tx.date.startsWith(period))
    .reduce<Record<string, number>>((acc, tx) => {
      acc[tx.category_id] = (acc[tx.category_id] || 0) + tx.converted_usd;
      return acc;
    }, {});

  const allCats = [
    ...categories,
    ...userCategories.map((uc) => ({
      id: uc.id,
      name: uc.name,
      icon: uc.icon,
      color: uc.color,
    })),
  ];

  if (periodBudgets.length === 0) return null;

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/20 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <span className="material-symbols-outlined text-lg">donut_small</span>
        </div>
        <h2 className="text-sm font-semibold text-on-surface">
          {t("dashboard.budgetVsActual")}
        </h2>
      </div>

      <div className="space-y-4">
        {periodBudgets.map((budget) => {
          const spent = spentByCategory[budget.category_id] || 0;
          const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
          const remaining = budget.amount - spent;
          const isOverBudget = remaining < 0;
          const cat = allCats.find((c) => c.id === budget.category_id);

          const barColor =
            percentage > 100
              ? "bg-error"
              : percentage > 80
              ? "bg-amber-500"
              : "bg-primary";

          return (
            <div key={budget.id} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant flex-shrink-0">
                    <span className="material-symbols-outlined text-base">
                      {cat?.icon || "help"}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-on-surface truncate">
                    {cat
                      ? getTranslatedCategoryName(cat.id, cat.name, t)
                      : t("chart.noCategory")}
                  </span>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="text-xs font-semibold text-on-surface">
                    ${spent.toFixed(2)} <span className="text-on-surface-variant font-normal">/ ${budget.amount.toFixed(2)}</span>
                  </p>
                  <p className={`text-[10px] font-medium ${
                    isOverBudget ? "text-error" : percentage > 80 ? "text-amber-600" : "text-emerald-600"
                  }`}>
                    {isOverBudget
                      ? `${t("dashboard.over")} $${Math.abs(remaining).toFixed(2)}`
                      : `${t("dashboard.left")} $${remaining.toFixed(2)}`}
                  </p>
                </div>
              </div>
              <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${barColor}`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
