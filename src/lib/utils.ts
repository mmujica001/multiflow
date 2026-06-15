import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(" ");
}

export function formatCurrency(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    USD: "$",
    VES: "Bs.",
    SOL: "◎",
  };
  const symbol = symbols[currency] || currency;
  const maxDec = currency === "SOL" ? 4 : 2;
  const minDec = currency === "SOL" ? (amount < 1 ? 4 : 2) : 2;
  return `${symbol}${amount.toLocaleString("en-US", {
    minimumFractionDigits: minDec,
    maximumFractionDigits: maxDec,
  })}`;
}

export function shortenAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export function convertAmount(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: Record<string, number>
): number {
  if (fromCurrency === toCurrency) return amount;
  const usdAmount =
    fromCurrency === "USD" ? amount : amount * (rates[fromCurrency] || 0);
  if (toCurrency === "USD") return usdAmount;
  return usdAmount / (rates[toCurrency] || 1);
}
