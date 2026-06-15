"use client";

import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useTranslation } from "react-i18next";
import { getTranslatedCategoryName } from "@/lib/i18n/categories";
import type { Transaction, Category } from "@/types";

interface CategoryChartProps {
  transactions: Transaction[];
  categories: Category[];
}

const COLORS = [
  "#2563eb",
  "#7c3aed",
  "#dc2626",
  "#f59e0b",
  "#059669",
  "#0891b2",
  "#db2777",
  "#6b7280",
];

export function CategoryChart({
  transactions,
  categories,
}: CategoryChartProps) {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const expenses = transactions.filter((t) => t.type === "expense");
  const totalExpenses = expenses.reduce((sum, t) => sum + t.converted_usd, 0);

  const byCategory = expenses.reduce<Record<string, number>>((acc, t) => {
    acc[t.category_id] = (acc[t.category_id] || 0) + t.converted_usd;
    return acc;
  }, {});

  const data = Object.entries(byCategory)
    .map(([categoryId, value]) => {
      const cat = categories.find((c) => c.id === categoryId);
      return {
        name: cat ? getTranslatedCategoryName(cat.id, cat.name, t) : t("chart.noCategory"),
        value: Math.round(value * 100) / 100,
        percentage: totalExpenses > 0 ? (value / totalExpenses) * 100 : 0,
      };
    })
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) {
    return (
      <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/20 shadow-sm">
        <h3 className="text-sm font-semibold text-on-surface mb-4">
          {t("chart.expensesByCategory")}
        </h3>
        <p className="text-sm text-on-surface-variant text-center py-8">
          {t("chart.noExpenses")}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/20 shadow-sm">
        <h3 className="text-sm font-semibold text-on-surface mb-4">
          {t("chart.expensesByCategory")}
        </h3>
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0" style={{ width: 144, height: 144, position: "relative" }}>
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={28}
                  outerRadius={48}
                  dataKey="value"
                >
                  {data.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`$${Number(value).toFixed(2)}`, t("chart.amount")]}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="flex-1 space-y-1.5">
          {data.slice(0, 5).map((item, index) => (
            <div key={item.name} className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-xs text-on-surface-variant flex-1 truncate">
                {item.name}
              </span>
              <span className="text-xs font-medium text-on-surface">
                {item.percentage.toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
