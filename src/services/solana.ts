import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

const USER_RPC = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;

const RPC_URLS: Record<string, string[]> = {
  mainnet: [
    USER_RPC || "https://api.mainnet-beta.solana.com",
    "https://solana-api.projectserum.com",
  ].filter(Boolean) as string[],
  devnet: ["https://api.devnet.solana.com"],
  testnet: ["https://api.testnet.solana.com"],
};

const connections = new Map<string, Connection>();

async function tryFetchBalance(
  address: PublicKey,
  urls: string[]
): Promise<number | null> {
  for (const url of urls) {
    try {
      const conn = new Connection(url, "confirmed");
      const balance = await conn.getBalance(address);
      return balance;
    } catch {}
  }
  return null;
}

export async function getSolBalance(
  address: string,
  network: string = "mainnet"
): Promise<number> {
  try {
    const pubKey = new PublicKey(address);
    const urls = RPC_URLS[network] || RPC_URLS.mainnet;
    const balanceLamports = await tryFetchBalance(pubKey, urls);
    if (balanceLamports === null) {
      console.warn("All RPC endpoints failed for network:", network);
      return 0;
    }
    return balanceLamports / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error("Error fetching SOL balance:", error);
    return 0;
  }
}

export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}
