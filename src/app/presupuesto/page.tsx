"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAppStore } from "@/stores/appStore";
import { createClient } from "@/lib/supabase";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { BudgetSummary } from "@/components/budget/BudgetSummary";
import { BudgetForm } from "@/components/budget/BudgetForm";
import { CategoryManager } from "@/components/categories/CategoryManager";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Settings2 } from "lucide-react";
import type { Budget, Category, Transaction, UserCategory } from "@/types";
import { defaultCategories } from "@/lib/i18n/categories";

export default function BudgetPage() {
  const { t } = useTranslation();
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const {
    budgets,
    setBudgets,
    addBudget,
    updateBudget,
    removeBudget,
    transactions,
    setTransactions,
    userCategories,
    setUserCategories,
    addUserCategory,
    updateUserCategory,
    removeUserCategory,
  } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [showForm, setShowForm] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const loadData = useCallback(async () => {
    if (!supabase || !user) return;
    const [catResult, txResult, budgetResult, userCatResult] = await Promise.all([
      supabase.from("categorias").select("*").order("name"),
      supabase
        .from("transacciones")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(200),
      supabase
        .from("budgets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("user_categories")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
    ]);
    if (catResult.data) setCategories(catResult.data as Category[]);
    if (txResult.data) setTransactions(txResult.data as unknown as Transaction[]);
    if (budgetResult.data) setBudgets(budgetResult.data as Budget[]);
    if (userCatResult.data) setUserCategories(userCatResult.data as UserCategory[]);
  }, [supabase, user, setCategories, setTransactions, setBudgets, setUserCategories]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/");
      return;
    }
    loadData().finally(() => setIsLoading(false));
  }, [user, authLoading, loadData, router]);

  const handleCreateBudget = async (data: { category_id: string; amount: number }) => {
    if (!supabase || !user) {
      console.error("Supabase not available");
      return;
    }
    const { data: newBudget, error } = await supabase
      .from("budgets")
      .insert({
        user_id: user.id,
        category_id: data.category_id,
        amount: data.amount,
        period: new Date().toISOString().slice(0, 7),
      })
      .select()
      .single();
    if (error) {
      console.error("Error creating budget:", error.message);
      return;
    }
    if (newBudget) {
      addBudget(newBudget as unknown as Budget);
      setShowForm(false);
    }
  };

  const handleUpdateBudget = async (data: { category_id: string; amount: number }) => {
    if (!supabase || !editingBudget) return;
    const { error } = await supabase
      .from("budgets")
      .update({ category_id: data.category_id, amount: data.amount })
      .eq("id", editingBudget.id);
    if (error) {
      console.error("Error updating budget:", error.message);
      return;
    }
    updateBudget(editingBudget.id, {
      category_id: data.category_id,
      amount: data.amount,
    });
    setEditingBudget(null);
    setShowForm(false);
  };

  const handleDeleteBudget = async (id: string) => {
    if (!supabase) return;
    const { error } = await supabase.from("budgets").delete().eq("id", id);
    if (error) {
      console.error("Error deleting budget:", error.message);
      return;
    }
    removeBudget(id);
  };

  const handleFormSubmit = async (data: { category_id: string; amount: number }) => {
    if (editingBudget) {
      await handleUpdateBudget(data);
    } else {
      await handleCreateBudget(data);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="w-full max-w-md min-h-screen bg-surface flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md min-h-screen bg-surface relative pb-24">
      <TopAppBar title={t("budget.title")} />

      <main className="flex-1 px-5 pt-2 space-y-4 pb-8">
        <div className="flex items-center justify-between">
          <p className="text-xs text-on-surface-variant">
            {new Date().toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
            })}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setEditingBudget(null);
                setShowForm(true);
              }}
              className="flex items-center gap-1.5 bg-secondary-container text-on-secondary-container rounded-full px-4 py-2 text-sm font-semibold shadow-sm hover:bg-secondary-container/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t("budget.add")}
            </button>
            <button
              onClick={() => setShowCategoryManager(true)}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-surface-container text-on-surface-variant hover:text-primary transition-colors"
            >
              <Settings2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <BudgetSummary
          budgets={budgets}
          transactions={transactions}
          categories={categories}
          userCategories={userCategories}
          onEdit={(budget) => {
            setEditingBudget(budget);
            setShowForm(true);
          }}
          onDelete={handleDeleteBudget}
        />
      </main>

      {showForm && (
        <BudgetForm
          categories={categories}
          userCategories={userCategories}
          editBudget={editingBudget}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingBudget(null);
          }}
        />
      )}

      {showCategoryManager && (
        <CategoryManager
          categories={categories}
          userCategories={userCategories}
          onAdd={async (data) => {
            if (!supabase || !user) return;
            const { data: newCat, error } = await supabase
              .from("user_categories")
              .insert({ user_id: user.id, ...data })
              .select()
              .single();
            if (!error && newCat) {
              addUserCategory(newCat as unknown as UserCategory);
            }
          }}
          onUpdate={async (id, data) => {
            if (!supabase) return;
            const { error } = await supabase
              .from("user_categories")
              .update(data)
              .eq("id", id);
            if (!error) updateUserCategory(id, data);
          }}
          onDelete={async (id) => {
            if (!supabase) return;
            const { error } = await supabase
              .from("user_categories")
              .delete()
              .eq("id", id);
            if (!error) removeUserCategory(id);
          }}
          onClose={() => setShowCategoryManager(false)}
        />
      )}

      <BottomNav />
    </div>
  );
}
