"use client";

import { useEffect, useState } from "react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Verificando...");

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setMessage("Error de configuración");
      return;
    }

    supabase.auth.onAuthStateChange((event: AuthChangeEvent) => {
      if (event === "SIGNED_IN") {
        router.push("/dashboard");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      if (session) {
        router.push("/dashboard");
      } else {
        setMessage("Enlace inválido o expirado");
      }
    });
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-surface">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-sm text-on-surface-variant">{message}</p>
      </div>
    </div>
  );
}
