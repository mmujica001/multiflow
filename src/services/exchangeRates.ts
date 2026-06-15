import { createClient } from "@/lib/supabase";

const JUPITER_API = process.env.NEXT_PUBLIC_JUPITER_API || "https://quote-api.jup.ag/v6";

export async function fetchSolPrice(): Promise<number> {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd",
      { signal: AbortSignal.timeout(5000) }
    );
    const data = await res.json();
    return data.solana?.usd || 0;
  } catch {
    try {
      const res = await fetch(
        `${JUPITER_API}/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=1000000000&slippageBps=50`,
        { signal: AbortSignal.timeout(5000) }
      );
      const data = await res.json();
      if (data.routePlan?.[0]) {
        const outAmount = Number(data.routePlan[0].outAmount);
        return 1 / (outAmount / 1_000_000);
      }
      return 0;
    } catch {
      return 0;
    }
  }
}

export async function fetchVesRate(): Promise<number> {
  const apis = [
    async () => {
      const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD", { signal: AbortSignal.timeout(5000) });
      const data = await res.json();
      return data.rates?.VES || 0;
    },
    async () => {
      const res = await fetch("https://ve.cryptosla.com/api/v1/rates", { signal: AbortSignal.timeout(5000) });
      const data = await res.json();
      return data.USD?.VES || 0;
    },
  ];

  for (const api of apis) {
    try {
      const rate = await api();
      if (rate > 0) return rate;
    } catch {}
  }
  return 0;
}

export async function saveRateToDB(pair: string, rate: number, source: string) {
  const supabase = createClient();
  if (!supabase) return;
  await (supabase.from("exchange_rates") as any).insert({
    pair,
    rate,
    source,
  });
}

export async function getLatestRates() {
  const supabase = createClient();
  if (!supabase) {
    return { solPrice: 0, vesRate: 0 };
  }
  const { data: solData } = await (supabase
    .from("exchange_rates") as any)
    .select("*")
    .eq("pair", "SOL/USD")
    .order("timestamp", { ascending: false })
    .limit(1)
    .single();
  const { data: vesData } = await (supabase
    .from("exchange_rates") as any)
    .select("*")
    .eq("pair", "USD/VES")
    .order("timestamp", { ascending: false })
    .limit(1)
    .single();
  return {
    solPrice: (solData as any)?.rate || 0,
    vesRate: (vesData as any)?.rate || 0,
  };
}
