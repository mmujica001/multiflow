"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import type { Category, Budget, UserCategory } from "@/types";
import { getTranslatedCategoryName } from "@/lib/i18n/categories";
import { X } from "lucide-react";

interface BudgetFormProps {
  categories: Category[];
  userCategories: UserCategory[];
  editBudget?: Budget | null;
  onSubmit: (data: { category_id: string; amount: number }) => Promise<void>;
  onCancel: () => void;
}

export function BudgetForm({
  categories,
  userCategories,
  editBudget,
  onSubmit,
  onCancel,
}: BudgetFormProps) {
  const { t } = useTranslation();

  const schema = useMemo(() => z.object({
    category_id: z.string().min(1, t("form.selectCategory")),
    amount: z.string().min(1, t("form.amountRequired")),
  }), [t]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<{ category_id: string; amount: string }>({
    resolver: zodResolver(schema) as any,
    defaultValues: editBudget
      ? { category_id: editBudget.category_id, amount: String(editBudget.amount) }
      : { category_id: "", amount: "" },
  });

  const allCats = [
    ...categories,
    ...userCategories.map((uc) => ({
      id: uc.id,
      name: uc.name,
      icon: uc.icon,
    })),
  ];

  const selectedCatId = watch("category_id");
  const selectedCategory = allCats.find((c) => c.id === selectedCatId);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
      <div className="w-full max-w-md bg-surface rounded-t-3xl sm:rounded-2xl p-5 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-on-surface">
            {editBudget ? t("budget.editBudget") : t("budget.newBudget")}
          </h2>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit((data) => onSubmit({ category_id: data.category_id, amount: Number(data.amount) }))} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-on-surface mb-3 block">
              {t("form.category")}
            </label>
            <div className="grid grid-cols-4 gap-3">
              {allCats.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setValue("category_id", cat.id)}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${
                    watch("category_id") === cat.id
                      ? "bg-primary/10 text-primary"
                      : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      watch("category_id") === cat.id
                        ? "bg-primary text-on-primary"
                        : "bg-surface-container text-on-surface-variant"
                    }`}
                  >
                    <span className="material-symbols-outlined text-xl">
                      {cat.icon}
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-center leading-tight">
                    {getTranslatedCategoryName(cat.id, cat.name, t)}
                  </span>
                </button>
              ))}
            </div>
            {errors.category_id && (
              <p className="text-xs text-error mt-1">{errors.category_id.message}</p>
            )}
          </div>

          {selectedCategory && (
            <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-2xl">
                    {selectedCategory.icon}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-on-surface">
                    {getTranslatedCategoryName(selectedCategory.id, selectedCategory.name, t)}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {t("budget.monthlyLimit")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-on-surface">$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  {...register("amount")}
                  className="bg-transparent border-none text-3xl font-bold text-on-surface w-full focus:outline-none focus:ring-0"
                />
              </div>
              {errors.amount && (
                <p className="text-xs text-error mt-1">{errors.amount.message}</p>
              )}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-secondary-container text-on-secondary-container rounded-full py-4 text-base font-semibold shadow-md hover:bg-secondary-container/90 transition-colors active:scale-[0.98]"
          >
            {editBudget ? t("budget.updateBudget") : t("budget.createBudget")}
          </button>
        </form>
      </div>
    </div>
  );
}
