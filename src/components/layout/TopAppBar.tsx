"use client";

import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface TopAppBarProps {
  title: string;
  showBack?: boolean;
  backHref?: string;
  subtitle?: string;
}

export function TopAppBar({ title, showBack, backHref, subtitle }: TopAppBarProps) {
  const { user } = useAuth();

  const handleBack = () => {
    if (backHref) {
      window.location.href = backHref;
    } else {
      window.history.back();
    }
  };

  return (
    <header className="bg-primary text-on-primary rounded-b-[2rem] w-full pt-4 pb-8 shadow-md relative z-10">
      <div className="flex items-center w-full mb-4 mt-2 px-5">
        {showBack && (
          <button
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-primary-container/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <h1
          className={`text-xl font-semibold text-center flex-1 ${
            showBack ? "-ml-10" : ""
          }`}
        >
          {title}
        </h1>
      </div>
      {(subtitle || user?.email) && (
        <div className="flex items-center justify-center gap-2 px-5 -mt-2">
          <div className="w-6 h-6 rounded-full bg-primary-container/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-sm text-on-primary/80">person</span>
          </div>
          <p className="text-center text-sm text-on-primary/70">
            {subtitle || user?.email}
          </p>
        </div>
      )}
    </header>
  );
}
