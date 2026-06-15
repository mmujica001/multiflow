"use client";

import { useTranslation } from "react-i18next";
import Link from "next/link";

interface BudgetHealthCardProps {
  totalBudgeted: number;
  totalSpent: number;
}

export function BudgetHealthCard({
  totalBudgeted,
  totalSpent,
}: BudgetHealthCardProps) {
  const { t } = useTranslation();
  const percentage = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;
  const remaining = totalBudgeted - totalSpent;
  const isOverBudget = remaining < 0;

  const barColor =
    percentage > 100
      ? "bg-error"
      : percentage > 80
      ? "bg-amber-500"
      : "bg-emerald-500";

  const statusColor = isOverBudget
    ? "text-error"
    : percentage > 80
    ? "text-amber-600"
    : "text-emerald-600";

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/20 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-lg">account_balance</span>
          </div>
          <h2 className="text-sm font-semibold text-on-surface">
            {t("dashboard.budgetHealth")}
          </h2>
        </div>
        <Link
          href="/presupuesto"
          className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
        >
          {t("dashboard.manageBudgets")}
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-surface-container rounded-xl p-3">
          <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-1">
            {t("dashboard.budgeted")}
          </p>
          <p className="text-sm font-bold text-on-surface">
            ${totalBudgeted.toFixed(2)}
          </p>
        </div>
        <div className="bg-surface-container rounded-xl p-3">
          <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-1">
            {t("dashboard.spent")}
          </p>
          <p className="text-sm font-bold text-on-surface">
            ${totalSpent.toFixed(2)}
          </p>
        </div>
        <div className="bg-surface-container rounded-xl p-3">
          <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mb-1">
            {isOverBudget ? t("dashboard.overBy") : t("dashboard.remaining")}
          </p>
          <p className={`text-sm font-bold ${statusColor}`}>
            {isOverBudget ? "-" : ""}${Math.abs(remaining).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="w-full h-2.5 bg-surface-container rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${barColor}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-on-surface-variant">
            {percentage.toFixed(1)}% {t("dashboard.utilized")}
          </span>
          {!isOverBudget && (
            <span className={percentage > 80 ? "text-amber-600 font-medium" : "text-emerald-600 font-medium"}>
              ${remaining.toFixed(2)} {t("dashboard.left")}
            </span>
          )}
          {isOverBudget && (
            <span className="text-error font-medium">
              ${Math.abs(remaining).toFixed(2)} {t("dashboard.over")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
