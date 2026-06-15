"use client";

import { useTranslation } from "react-i18next";
import type { Budget } from "@/types";
import { Pencil, Trash2 } from "lucide-react";

interface BudgetCardProps {
  budget: Budget;
  spent: number;
  categoryName: string;
  categoryIcon: string;
  onEdit: () => void;
  onDelete: () => void;
}

export function BudgetCard({
  budget,
  spent,
  categoryName,
  categoryIcon,
  onEdit,
  onDelete,
}: BudgetCardProps) {
  const { t } = useTranslation();
  const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
  const remaining = budget.amount - spent;
  const isOverBudget = remaining < 0;

  const barColor =
    percentage > 100
      ? "bg-error"
      : percentage > 80
      ? "bg-amber-500"
      : "bg-primary";

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/20 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-xl">
              {categoryIcon}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-on-surface">
              {categoryName}
            </p>
            <p className="text-xs text-on-surface-variant">
              {budget.period}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={onEdit}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-error transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-on-surface-variant">
            {t("budget.spent")}: <strong className="text-on-surface">${spent.toFixed(2)}</strong>
          </span>
          <span className="text-on-surface-variant">
            {t("budget.of")} <strong className="text-on-surface">${budget.amount.toFixed(2)}</strong>
          </span>
        </div>

        <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${barColor}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>

        <div className="flex justify-between text-xs">
          <span className={isOverBudget ? "text-error font-medium" : "text-on-surface-variant"}>
            {percentage.toFixed(0)}%
          </span>
          <span className={isOverBudget ? "text-error font-medium" : "text-emerald-600 font-medium"}>
            {isOverBudget
              ? `${t("budget.over")} $${Math.abs(remaining).toFixed(2)}`
              : `${t("budget.left")} $${remaining.toFixed(2)}`}
          </span>
        </div>
      </div>
    </div>
  );
}
