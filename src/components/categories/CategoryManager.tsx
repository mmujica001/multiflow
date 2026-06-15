"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { X, Pencil, Trash2, Plus } from "lucide-react";
import { CategoryForm } from "./CategoryForm";
import { getTranslatedCategoryName } from "@/lib/i18n/categories";
import type { Category, UserCategory } from "@/types";

interface CategoryManagerProps {
  categories: Category[];
  userCategories: UserCategory[];
  onAdd: (data: { name: string; icon: string; color?: string | null; icon_url?: string | null }) => Promise<void>;
  onUpdate: (id: string, data: Partial<{ name: string; icon: string; color: string | null; icon_url: string | null }>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
}

export function CategoryManager({
  categories,
  userCategories,
  onAdd,
  onUpdate,
  onDelete,
  onClose,
}: CategoryManagerProps) {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<UserCategory | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
      <div className="w-full max-w-md bg-surface rounded-t-3xl sm:rounded-2xl p-5 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-on-surface">
            {t("categories.manage")}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!showForm ? (
          <>
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                  {t("categories.default")}
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-surface-container"
                    >
                      <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                        <span className="material-symbols-outlined text-xl">
                          {cat.icon}
                        </span>
                      </div>
                      <span className="text-[10px] font-medium text-center text-on-surface-variant leading-tight">
                        {getTranslatedCategoryName(cat.id, cat.name, t)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {userCategories.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                    {t("categories.custom")}
                  </h3>
                  <div className="grid grid-cols-4 gap-3">
                    {userCategories.map((cat) => (
                      <div
                        key={cat.id}
                        className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-surface-container relative group"
                      >
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{
                            backgroundColor: cat.color || "var(--color-surface-container-high)",
                          }}
                        >
                          {cat.icon_url ? (
                            <img src={cat.icon_url} alt="" className="w-6 h-6 object-contain" />
                          ) : (
                            <span className="material-symbols-outlined text-xl text-white">
                              {cat.icon}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-medium text-center text-on-surface leading-tight">
                          {cat.name}
                        </span>
                        <div className="absolute -top-1 -right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingCategory(cat);
                              setShowForm(true);
                            }}
                            className="w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => onDelete(cat.id)}
                            className="w-5 h-5 rounded-full bg-error text-on-error flex items-center justify-center"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setEditingCategory(null);
                setShowForm(true);
              }}
              className="w-full flex items-center justify-center gap-2 bg-primary/10 text-primary rounded-full py-3 text-sm font-semibold hover:bg-primary/20 transition-colors mt-5"
            >
              <Plus className="w-4 h-4" />
              {t("categories.addCustom")}
            </button>
          </>
        ) : (
          <CategoryForm
            editCategory={editingCategory}
            onSubmit={async (data) => {
              if (editingCategory) {
                await onUpdate(editingCategory.id, data);
              } else {
                await onAdd(data);
              }
              setShowForm(false);
              setEditingCategory(null);
            }}
            onCancel={() => {
              setShowForm(false);
              setEditingCategory(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
