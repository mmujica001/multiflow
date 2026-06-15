import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "MultiFlow — Finanzas híbridas",
  description:
    "Libro contable inteligente que consolida tus finanzas tradicionales y cripto en una sola pantalla",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#004ac6",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col items-center" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
