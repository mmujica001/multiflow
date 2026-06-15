"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { Loader2 } from "lucide-react";

export default function LandingPage() {
  const { t } = useTranslation();
  const { user, isLoading, signInWithEmail, signUpWithEmail } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    if (user) router.push("/dashboard");
  }, [user, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const err = isSignUp
      ? await signUpWithEmail(email, password)
      : await signInWithEmail(email, password);
    if (err) setError(err);
    if (!err && isSignUp) setSuccess(t("landing.accountCreated"));
  };

  return (
    <div className="w-full max-w-md min-h-screen bg-surface flex flex-col px-5">
      <div className="flex justify-end pt-4">
        <LanguageSwitcher />
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-container rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="material-symbols-outlined text-3xl text-on-primary">
              account_balance
            </span>
          </div>
          <h1 className="text-3xl font-bold text-on-surface">MultiFlow</h1>
          <p className="text-sm text-on-surface-variant mt-2 max-w-xs mx-auto">
            {t("landing.subtitle")}
          </p>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/20">
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              placeholder={t("landing.email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm border border-outline-variant/20 focus:outline-none focus:border-primary transition-colors"
              required
            />
            <input
              type="password"
              placeholder={t("landing.password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm border border-outline-variant/20 focus:outline-none focus:border-primary transition-colors"
              required
            />
            {error && <p className="text-xs text-error">{t(error)}</p>}
            {success && <p className="text-xs text-emerald-600 text-center">{t(success)}</p>}
            <button
              type="submit"
              className="w-full bg-primary text-on-primary rounded-full py-3 text-sm font-semibold shadow-sm hover:bg-primary/90 transition-colors"
            >
              {isSignUp ? t("landing.createAccount") : t("landing.signIn")}
            </button>
          </form>

          <p className="text-center text-xs text-on-surface-variant mt-4">
            {isSignUp ? t("landing.alreadyHaveAccount") : t("landing.dontHaveAccount")} {" "}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary font-medium hover:underline"
            >
              {isSignUp ? t("landing.logIn") : t("landing.signUp")}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
