"use client";

import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Upload, X } from "lucide-react";

interface IconUploadProps {
  value: string | null;
  onChange: (url: string) => void;
  onRemove: () => void;
}

export function IconUpload({ value, onChange, onRemove }: IconUploadProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(value);

  const handleFile = (file: File) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert(t("form.imageTooLarge"));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);
      onChange(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <label className="text-sm font-medium text-on-surface mb-3 block">
        {t("categories.customIcon")}
      </label>
      {preview ? (
        <div className="relative w-20 h-20">
          <img
            src={preview}
            alt="icon preview"
            className="w-full h-full object-cover rounded-xl"
          />
          <button
            type="button"
            onClick={() => {
              setPreview(null);
              onRemove();
            }}
            className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant shadow-sm"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 bg-surface-container rounded-xl px-4 py-3 text-sm text-on-surface-variant hover:text-primary transition-colors"
        >
          <Upload className="w-4 h-4" />
          {t("categories.uploadIcon")}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/svg+xml,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
