export interface Database {
  public: {
    Tables: {
      categorias: {
        Row: {
          id: string;
          name: string;
          icon: string;
          color: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          icon: string;
          color?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          icon?: string;
          color?: string | null;
          created_at?: string;
        };
      };
      wallets: {
        Row: {
          id: string;
          user_id: string;
          address: string;
          blockchain: string;
          nickname: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          address: string;
          blockchain: string;
          nickname: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          address?: string;
          blockchain?: string;
          nickname?: string;
          created_at?: string;
        };
      };
      transacciones: {
        Row: {
          id: string;
          user_id: string;
          type: "income" | "expense";
          amount: number;
          currency: "USD" | "VES" | "SOL";
          category_id: string;
          description: string;
          date: string;
          converted_usd: number;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: "income" | "expense";
          amount: number;
          currency: "USD" | "VES" | "SOL";
          category_id: string;
          description: string;
          date: string;
          converted_usd?: number;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: "income" | "expense";
          amount?: number;
          currency?: "USD" | "VES" | "SOL";
          category_id?: string;
          description?: string;
          date?: string;
          converted_usd?: number;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      exchange_rates: {
        Row: {
          id: string;
          pair: string;
          rate: number;
          source: string;
          timestamp: string;
        };
        Insert: {
          id?: string;
          pair: string;
          rate: number;
          source: string;
          timestamp?: string;
        };
        Update: {
          id?: string;
          pair?: string;
          rate?: number;
          source?: string;
          timestamp?: string;
        };
      };
      budgets: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          amount: number;
          period: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          amount: number;
          period: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string;
          amount?: number;
          period?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          icon: string;
          color: string | null;
          icon_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          icon: string;
          color?: string | null;
          icon_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          icon?: string;
          color?: string | null;
          icon_url?: string | null;
          created_at?: string;
        };
      };
    };
  };
}
