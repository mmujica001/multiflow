"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase";
import { useAppStore } from "@/stores/appStore";
import { formatCurrency } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import type { Transaction } from "@/types";
import { Trash2, Pencil, Calendar, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

interface TransactionListProps {
  transactions: Transaction[];
}

const categoryIcons: Record<string, string> = {
  "1": "restaurant",
  "2": "shopping_bag",
  "3": "local_hospital",
  "4": "directions_car",
  "5": "receipt",
  "6": "home",
  "7": "movie",
  "8": "more_horiz",
};

type DatePreset = "all" | "this_month" | "last_month" | "last_3_months" | "last_year" | "custom";

function getDateRange(preset: DatePreset, customFrom?: string, customTo?: string): { from: Date | null; to: Date | null } {
  const now = new Date();
  const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
  const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

  switch (preset) {
    case "this_month":
      return { from: startOfMonth(now), to: endOfMonth(now) };
    case "last_month": {
      const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return { from: startOfMonth(lm), to: endOfMonth(lm) };
    }
    case "last_3_months": {
      const l3 = new Date(now);
      l3.setMonth(l3.getMonth() - 3);
      return { from: startOfMonth(l3), to: endOfMonth(now) };
    }
    case "last_year": {
      const ly = new Date(now);
      ly.setFullYear(ly.getFullYear() - 1);
      return { from: startOfMonth(ly), to: endOfMonth(now) };
    }
    case "custom": {
      const from = customFrom ? new Date(customFrom + "T00:00:00") : null;
      const to = customTo ? new Date(customTo + "T23:59:59") : null;
      return { from, to };
    }
    default:
      return { from: null, to: null };
  }
}

const datePresetKeys: { labelKey: string; value: DatePreset }[] = [
  { labelKey: "datePresets.all", value: "all" },
  { labelKey: "datePresets.thisMonth", value: "this_month" },
  { labelKey: "datePresets.lastMonth", value: "last_month" },
  { labelKey: "datePresets.last3Months", value: "last_3_months" },
  { labelKey: "datePresets.lastYear", value: "last_year" },
  { labelKey: "datePresets.custom", value: "custom" },
];

export function TransactionList({ transactions }: TransactionListProps) {
  const { t, i18n } = useTranslation();
  const supabase = createClient();
  const removeTransaction = useAppStore((s) => s.removeTransaction);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterCurrency, setFilterCurrency] = useState<string>("all");
  const [datePreset, setDatePreset] = useState<DatePreset>("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const filtered = useMemo(() => {
    const { from, to } = getDateRange(datePreset, customFrom, customTo);

    return transactions.filter((tx) => {
      if (filterType !== "all" && tx.type !== filterType) return false;
      if (filterCurrency !== "all" && tx.currency !== filterCurrency) return false;
      if (from || to) {
        const txDate = new Date(tx.date);
        if (from && txDate < from) return false;
        if (to && txDate > to) return false;
      }
      return true;
    });
  }, [transactions, filterType, filterCurrency, datePreset, customFrom, customTo]);

  const handleDelete = async (id: string) => {
    if (!confirm(t("transactions.deleteConfirm"))) return;
    if (!supabase) return;
    const { error } = await supabase.from("transacciones").delete().eq("id", id);
    if (!error) removeTransaction(id);
  };

  return (
    <div>
      <div className="space-y-3 mb-4">
        <div className="flex gap-2">
          {[
            { labelKey: "transactions.all", value: "all" },
            { labelKey: "transactions.income", value: "income" },
            { labelKey: "transactions.expense", value: "expense" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilterType(f.value)}
              className={`flex-1 py-2 rounded-full text-sm font-medium text-center transition-all ${
                filterType === f.value
                  ? "bg-primary text-on-primary shadow-sm"
                  : "border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              {t(f.labelKey)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[
            { label: t("transactions.allCurrencies"), value: "all" },
            { label: "USD", value: "USD" },
            { label: "VES", value: "VES" },
            { label: "SOL", value: "SOL" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilterCurrency(f.value)}
              className={`py-2 rounded-full text-sm font-medium transition-all ${
                filterCurrency === f.value
                  ? "bg-primary text-on-primary shadow-sm"
                  : "border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-3">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-on-surface-variant" />
            <span className="text-xs font-medium text-on-surface-variant">{t("transactions.date")}</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {datePresetKeys.map((p) => (
              <button
                key={p.value}
                onClick={() => setDatePreset(p.value)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  datePreset === p.value
                    ? "bg-primary text-on-primary shadow-sm"
                    : "border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low"
                }`}
              >
                {t(p.labelKey)}
              </button>
            ))}
          </div>
          {datePreset === "custom" && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="block text-[10px] text-on-surface-variant mb-1">{t("transactions.from")}</label>
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="w-full bg-surface-container-low rounded-lg px-3 py-1.5 text-sm border border-outline-variant/20 focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] text-on-surface-variant mb-1">{t("transactions.to")}</label>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="w-full bg-surface-container-low rounded-lg px-3 py-1.5 text-sm border border-outline-variant/20 focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-on-surface-variant">
            {t("transactions.noTransactions")}
          </p>
          <Link
            href="/transactions/new"
            className="inline-block mt-3 text-sm font-medium text-primary hover:underline"
          >
            {t("transactions.addFirst")}
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/20 shadow-sm hover:bg-surface-container-low transition-colors group"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    tx.type === "income"
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">
                    {categoryIcons[tx.category_id] || "receipt"}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-on-surface truncate">
                      {tx.description}
                    </p>
                    {tx.image_url && (
                      <ImageIcon className="w-3.5 h-3.5 text-on-surface-variant flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    {new Date(tx.date).toLocaleDateString(i18n.language === "en" ? "en-US" : i18n.language === "fr" ? "fr-FR" : "es-ES", {
                      day: "numeric",
                      month: "short",
                    })}{" "}
                    · {tx.currency}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="text-right">
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
                  <p className="text-[11px] text-on-surface-variant">
                    ${tx.converted_usd.toFixed(2)}
                  </p>
                </div>
                <div className="hidden group-hover:flex items-center gap-1 ml-1">
                  <Link
                    href={`/transactions/${tx.id}/edit`}
                    className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(tx.id)}
                    className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-error transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
