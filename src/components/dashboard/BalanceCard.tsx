"use client";

import { formatCurrency } from "@/lib/utils";

interface BalanceCardProps {
  title: string;
  amount: number;
  currency?: string;
  usdValue?: number;
  isCrypto?: boolean;
  subtitle?: string;
}

export function BalanceCard({
  title,
  amount,
  currency = "USD",
  usdValue,
  isCrypto,
  subtitle,
}: BalanceCardProps) {
  return (
    <div
      className={`rounded-xl p-4 shadow-sm border flex flex-col justify-between ${
        isCrypto
          ? "bg-surface-container-lowest border-primary/20"
          : "bg-surface-container-lowest border-outline-variant/20"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        {isCrypto && (
          <div className="w-2 h-2 rounded-full bg-secondary-container flex-shrink-0" />
        )}
        <span className="text-xs font-medium text-on-surface-variant">
          {title}
        </span>
      </div>
      <div>
        <p className="text-lg font-bold text-on-surface">
          {formatCurrency(amount, currency)}
        </p>
        {usdValue !== undefined && (
          <p className="text-xs mt-0.5 font-mono tracking-tight text-on-surface-variant/70">
            ≈ {formatCurrency(usdValue, "USD")}
          </p>
        )}
        {subtitle && (
          <p className="text-xs mt-0.5 font-mono tracking-tight text-on-surface-variant/70">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
