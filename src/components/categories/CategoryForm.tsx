"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { IconPicker } from "./IconPicker";
import { IconUpload } from "./IconUpload";
import type { UserCategory } from "@/types";

type FormData = {
  name: string;
  icon: string;
  color: string;
};

interface CategoryFormProps {
  editCategory?: UserCategory | null;
  onSubmit: (data: { name: string; icon: string; color?: string | null; icon_url?: string | null }) => Promise<void>;
  onCancel: () => void;
}

export function CategoryForm({ editCategory, onSubmit, onCancel }: CategoryFormProps) {
  const { t } = useTranslation();
  const [iconUrl, setIconUrl] = useState<string | null>(editCategory?.icon_url || null);

  const schema = useMemo(() => z.object({
    name: z.string().min(1, t("categories.nameRequired")),
    icon: z.string().min(1, t("categories.iconRequired")),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/, t("categories.invalidColor")),
  }), [t]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: editCategory
      ? { name: editCategory.name, icon: editCategory.icon, color: editCategory.color || "#2563eb" }
      : { name: "", icon: "more_horiz", color: "#2563eb" },
  });

  const currentColor = watch("color");

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
      <div className="w-full max-w-md bg-surface rounded-t-3xl sm:rounded-2xl p-5 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-on-surface">
            {editCategory ? t("categories.editCategory") : t("categories.newCategory")}
          </h2>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit((data) => onSubmit({ ...data, icon_url: iconUrl }))} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-on-surface mb-3 block">
              {t("categories.name")}
            </label>
            <input
              type="text"
              placeholder={t("categories.namePlaceholder")}
              {...register("name")}
              className="w-full bg-surface-container-lowest rounded-xl px-4 py-3 border border-outline-variant/20 text-sm focus:outline-none focus:border-primary transition-colors"
            />
            {errors.name && (
              <p className="text-xs text-error mt-1">{errors.name.message}</p>
            )}
          </div>

          <IconPicker
            selected={watch("icon")}
            onSelect={(icon) => setValue("icon", icon)}
          />
          {errors.icon && (
            <p className="text-xs text-error mt-1">{errors.icon.message}</p>
          )}

          <IconUpload
            value={iconUrl}
            onChange={setIconUrl}
            onRemove={() => setIconUrl(null)}
          />

          <div>
            <label className="text-sm font-medium text-on-surface mb-3 block">
              {t("categories.color")}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                {...register("color")}
                className="w-10 h-10 rounded-lg border border-outline-variant/20 cursor-pointer bg-transparent p-0.5"
              />
              <input
                type="text"
                {...register("color")}
                placeholder="#2563eb"
                className="flex-1 bg-surface-container-lowest rounded-xl px-4 py-3 border border-outline-variant/20 text-sm font-mono focus:outline-none focus:border-primary transition-colors"
              />
              <div
                className="w-8 h-8 rounded-full"
                style={{ backgroundColor: currentColor }}
              />
            </div>
            {errors.color && (
              <p className="text-xs text-error mt-1">{errors.color.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-secondary-container text-on-secondary-container rounded-full py-4 text-base font-semibold shadow-md hover:bg-secondary-container/90 transition-colors active:scale-[0.98]"
          >
            {editCategory ? t("categories.updateCategory") : t("categories.createCategory")}
          </button>
        </form>
      </div>
    </div>
  );
}
