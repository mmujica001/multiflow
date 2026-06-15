export type Currency = "USD" | "VES" | "SOL";

export type TransactionType = "income" | "expense";

export interface Category {
  id: string;
  name: string;
  icon: string;
  color?: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  currency: Currency;
  category_id: string;
  description: string;
  date: string;
  converted_usd: number;
  image_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  address: string;
  blockchain: string;
  nickname: string;
  created_at: string;
}

export interface ExchangeRate {
  id: string;
  pair: string;
  rate: number;
  source: string;
  timestamp: string;
}

export interface UserPreferences {
  base_currency: Currency;
  theme: "light" | "dark";
}

export interface DashboardBalance {
  total_usd: number;
  fiat_usd: number;
  crypto_usd: number;
  sol_balance: number;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  period: string;
  created_at: string;
  updated_at: string;
}

export interface UserCategory {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color?: string | null;
  icon_url?: string | null;
  created_at: string;
}
