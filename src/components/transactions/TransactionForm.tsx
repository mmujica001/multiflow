"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAppStore } from "@/stores/appStore";

type FormData = {
  type: "expense" | "income";
  amount: string;
  currency: "USD" | "VES" | "SOL";
  category_id: string;
  description: string;
  date: string;
};
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { convertAmount } from "@/lib/utils";
import { uploadTransactionImage, deleteTransactionImage } from "@/lib/upload";
import { useTranslation } from "react-i18next";
import type { Category, Currency, TransactionType } from "@/types";
import { useState, useEffect, useRef, useMemo } from "react";
import { Camera, Image as ImageIcon, X } from "lucide-react";

import { defaultCategories as defaultCats } from "@/lib/i18n/categories";
import { getTranslatedCategoryName } from "@/lib/i18n/categories";

interface TransactionFormProps {
  onSuccess: () => void;
  editTransaction?: {
    id: string;
    type: TransactionType;
    amount: number;
    currency: Currency;
    category_id: string;
    description: string;
    date: string;
    image_url?: string | null;
  };
}

export function TransactionForm({
  onSuccess,
  editTransaction,
}: TransactionFormProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const supabase = createClient();
  const solPrice = useAppStore((s) => s.solPrice);
  const vesRate = useAppStore((s) => s.vesRate);
  const addTransaction = useAppStore((s) => s.addTransaction);
  const updateTransaction = useAppStore((s) => s.updateTransaction);
  const [categories, setCategories] = useState<Category[]>(defaultCats);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [convertedPreview, setConvertedPreview] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string | null>(
    editTransaction?.image_url ?? null
  );
  const [isUploading, setIsUploading] = useState(false);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const schema = useMemo(() => z.object({
    type: z.enum(["expense", "income"]),
    amount: z.string().min(1, t("form.amountRequired")),
    currency: z.enum(["USD", "VES", "SOL"]),
    category_id: z.string().min(1, t("form.selectCategory")),
    description: z.string().min(1, t("form.descriptionRequired")),
    date: z.string().min(1, t("form.dateRequired")),
  }), [t]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: editTransaction
      ? {
          type: editTransaction.type,
          amount: String(editTransaction.amount),
          currency: editTransaction.currency,
          category_id: editTransaction.category_id,
          description: editTransaction.description,
          date: editTransaction.date,
        }
      : {
          type: "expense",
          amount: "",
          currency: "USD",
          category_id: "",
          description: "",
          date: new Date().toISOString().split("T")[0],
        },
  });

  const watchType = watch("type");
  const watchAmount = watch("amount");
  const watchCurrency = watch("currency");

  useEffect(() => {
    if (watchAmount && watchCurrency) {
      const usdValue = convertAmount(
        Number(watchAmount),
        watchCurrency,
        "USD",
        { SOL: solPrice, VES: vesRate }
      );
      setConvertedPreview(
        usdValue > 0 ? `≈ $${usdValue.toFixed(2)} USD` : ""
      );
    }
  }, [watchAmount, watchCurrency, solPrice, vesRate]);

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("categorias")
      .select("*")
      .order("name")
      .then(({ data }: { data: any }) => {
        if (data && data.length > 0) setCategories(data);
      });
  }, [supabase]);

  const handleImageUpload = async (file: File) => {
    if (!user) return;
    if (file.size > 5 * 1024 * 1024) {
      alert(t("form.imageTooLarge"));
      return;
    }
    setIsUploading(true);
    const url = await uploadTransactionImage(user.id, file);
    if (url) setImageUrl(url);
    setIsUploading(false);
  };

  const handleRemoveImage = async () => {
    if (imageUrl) await deleteTransactionImage(imageUrl);
    setImageUrl(null);
  };

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    setIsSubmitting(true);

    const convertedUsd = convertAmount(
      Number(data.amount),
      data.currency,
      "USD",
      { SOL: solPrice, VES: vesRate }
    );

    if (!supabase) return;

    if (editTransaction) {
      const { error } = await (supabase
        .from("transacciones") as any)
        .update({
          type: data.type,
          amount: Number(data.amount),
          currency: data.currency,
          category_id: data.category_id,
          description: data.description,
          date: data.date,
          converted_usd: convertedUsd,
          image_url: imageUrl,
        })
        .eq("id", editTransaction.id);

      if (!error) {
        updateTransaction(editTransaction.id, {
          type: data.type,
          amount: Number(data.amount),
          currency: data.currency,
          category_id: data.category_id,
          description: data.description,
          date: data.date,
          converted_usd: convertedUsd,
          image_url: imageUrl,
        });
        onSuccess();
      }
    } else {
      const { data: newTx, error } = await (supabase
        .from("transacciones") as any)
        .insert({
          user_id: user.id,
          type: data.type,
          amount: Number(data.amount),
          currency: data.currency,
          category_id: data.category_id,
          description: data.description,
          date: data.date,
          converted_usd: convertedUsd,
          image_url: imageUrl,
        })
        .select()
        .single();

      if (!error && newTx) {
        addTransaction(newTx as any);
        onSuccess();
      }
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="bg-surface rounded-full p-1 shadow-sm border border-outline-variant/30 flex w-full">
        <button
          type="button"
          onClick={() => setValue("type", "expense")}
          className={`flex-1 py-2 text-sm font-medium rounded-full transition-all text-center ${
            watchType === "expense"
              ? "bg-primary text-on-primary shadow-sm"
              : "text-on-surface-variant hover:bg-surface-container-low"
          }`}
        >
          {t("form.expenses")}
        </button>
        <button
          type="button"
          onClick={() => setValue("type", "income")}
          className={`flex-1 py-2 text-sm font-medium rounded-full transition-all text-center ${
            watchType === "income"
              ? "bg-primary text-on-primary shadow-sm"
              : "text-on-surface-variant hover:bg-surface-container-low"
          }`}
        >
          {t("form.incomes")}
        </button>
      </div>

      <div className="flex items-center justify-center">
        <div className="flex items-end gap-1">
          <span className="text-lg font-semibold text-on-surface-variant mb-1">
            {watchCurrency === "USD"
              ? "$"
              : watchCurrency === "VES"
              ? "Bs."
              : "◎"}
          </span>
          <input
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            {...register("amount")}
            className="bg-transparent border-none text-4xl font-bold text-on-surface text-center w-40 focus:outline-none focus:ring-0 p-0"
          />
        </div>
      </div>
      {convertedPreview && (
        <p className="text-center text-sm text-on-surface-variant -mt-3">
          {convertedPreview}
        </p>
      )}
      {errors.amount && (
        <p className="text-center text-xs text-error -mt-3">
          {errors.amount.message}
        </p>
      )}

      <div className="flex gap-2">
        {(["USD", "VES", "SOL"] as Currency[]).map((cur) => (
          <button
            key={cur}
            type="button"
            onClick={() => setValue("currency", cur)}
            className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${
              watchCurrency === cur
                ? "bg-primary-container text-on-primary-container shadow-sm"
                : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            {cur}
          </button>
        ))}
      </div>

      <div>
        <label className="text-sm font-medium text-on-surface mb-3 block">
          {t("form.category")}
        </label>
        <div className="grid grid-cols-4 gap-3">
          {categories.map((cat) => (
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
              <span className="text-[10px] font-medium">{getTranslatedCategoryName(cat.id, cat.name, t)}</span>
            </button>
          ))}
        </div>
        {errors.category_id && (
          <p className="text-xs text-error mt-1">
            {errors.category_id.message}
          </p>
        )}
      </div>

      <div>
        <input
          type="text"
          placeholder={t("form.description")}
          {...register("description")}
          className="w-full bg-surface-container-lowest rounded-xl px-4 py-3 border border-outline-variant/20 text-sm focus:outline-none focus:border-primary transition-colors"
        />
        {errors.description && (
          <p className="text-xs text-error mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-on-surface mb-3 block">
          {t("form.photo")}
        </label>
        {imageUrl ? (
          <div className="relative">
            <img
              src={imageUrl}
              alt="Preview"
              className="w-full h-40 object-cover rounded-xl"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => cameraRef.current?.click()}
              disabled={isUploading}
              className="flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border-2 border-dashed border-outline-variant/30 text-on-surface-variant hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
            >
              <Camera className="w-6 h-6" />
              <span className="text-xs font-medium">{t("form.takePhoto")}</span>
            </button>
            <button
              type="button"
              onClick={() => galleryRef.current?.click()}
              disabled={isUploading}
              className="flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border-2 border-dashed border-outline-variant/30 text-on-surface-variant hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
            >
              <ImageIcon className="w-6 h-6" />
              <span className="text-xs font-medium">{t("form.uploadPhoto")}</span>
            </button>
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
                e.target.value = "";
              }}
            />
            <input
              ref={galleryRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
                e.target.value = "";
              }}
            />
          </div>
        )}
        {isUploading && (
          <p className="text-xs text-on-surface-variant mt-1 text-center">
            {t("form.uploading")}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between bg-surface-container-lowest rounded-xl px-4 py-3 border border-outline-variant/20 cursor-pointer">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-xl">
              calendar_today
            </span>
          </div>
          <input
            type="date"
            {...register("date")}
            className="bg-transparent border-none text-sm text-on-surface focus:outline-none"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-secondary-container text-on-secondary-container rounded-full py-4 text-base font-semibold shadow-md hover:bg-secondary-container/90 transition-colors active:scale-[0.98] disabled:opacity-50"
      >
        {isSubmitting
          ? t("form.saving")
          : editTransaction
          ? t("form.updateTransaction")
          : t("form.addTransaction")}
      </button>
    </form>
  );
}
