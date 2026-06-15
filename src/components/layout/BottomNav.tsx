"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Plus,
  Settings,
  PiggyBank,
} from "lucide-react";

export function BottomNav() {
  const { t } = useTranslation();
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: t("nav.dashboard"), icon: LayoutDashboard },
    { href: "/transactions", label: t("nav.transactions"), icon: ArrowLeftRight },
    { href: "/presupuesto", label: t("nav.presupuesto"), icon: PiggyBank },
    { href: "/transactions/new", label: t("nav.add"), icon: Plus, fab: true },
    { href: "/settings", label: t("nav.settings"), icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-lg border-t border-outline-variant/30 max-w-md mx-auto">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.fab) {
            return (
              <div key={item.href} className="flex items-center justify-center">
                <Link
                  href={item.href}
                  className="flex items-center justify-center w-12 h-12 bg-secondary-container text-on-secondary-container rounded-full shadow-lg hover:bg-secondary-container/90 transition-transform active:scale-95 -mt-3"
                >
                  <Icon className="w-6 h-6" />
                </Link>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
