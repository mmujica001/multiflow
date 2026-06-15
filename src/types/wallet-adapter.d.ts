declare module "@solana/wallet-adapter-wallets" {
  export class PhantomWalletAdapter {
    constructor(config?: any);
  }
  export class SolflareWalletAdapter {
    constructor(config?: any);
  }
}

declare module "@solana/wallet-adapter-react-ui" {
  import type { FC, ReactNode, ButtonHTMLAttributes } from "react";
  export const WalletModalProvider: FC<{ children: ReactNode }>;
  export const WalletMultiButton: FC<ButtonHTMLAttributes<HTMLButtonElement>>;
}
