<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# MultiFlow — Hybrid Finance Tracker

Next.js 16.2.x on canary (App Router) with React 19, TypeScript strict mode, Tailwind CSS v4 (`@tailwindcss/postcss`, inline `@theme` in `globals.css` — no `tailwind.config.js`), Supabase (Postgres + Auth SSR via `@supabase/ssr`), Zustand, react-hook-form + Zod, Solana Web3.js with Phantom/Solflare adapters, Recharts, Lucide icons, and ESLint v9 flat config (`eslint.config.mjs`).

## Commands

Use `npm run dev` for the development server on port 3000. `npm run build` creates a production build. `npm run lint` runs ESLint. There is no test framework installed and no CI pipeline configured.

## Environment variables

Four variables are required in `.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SOLANA_RPC_URL`, and `NEXT_PUBLIC_JUPITER_API`. The Supabase client in `src/lib/supabase.ts` silently returns `null` when environment variables are missing.

## Architecture

All pages are client components (`"use client"`) — the application does not use React Server Components. The middleware lives at `src/proxy.ts` (not `middleware.ts`) and exports a `config.matcher` to protect `/dashboard`, `/transactions`, and `/settings`. The Supabase client is a singleton browser client created from `@supabase/ssr`. Authentication uses Supabase email/password with an optional Solana wallet. The Solana wallet providers (`SolanaWalletProvider`, `WalletButton`) are loaded dynamically with `ssr: false`. All client state lives in the Zustand store at `src/stores/appStore.ts`. The path alias `@/*` resolves to `./src/*`.

## Database

The migration at `supabase/migration.sql` defines four tables: `categorias` (seeded with eight defaults), `wallets`, `transacciones`, and `exchange_rates`. Row-level security is enabled on all tables — authenticated users can read categories and exchange rates but can only read and write their own wallets and transactions. A helper function `get_user_balance_usd(user_id)` computes total balance from transactions.

## UI conventions

All user-facing text is in Spanish. The layout is mobile-first with a `max-w-md` container, a bottom navigation bar with a floating action button, rounded cards, Material Symbols Outlined icons, and the Geist font. Every protected page shows a centered spinner while authentication state resolves.
