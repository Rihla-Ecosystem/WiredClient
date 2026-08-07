"use client";

import { type ReactNode, useEffect } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { restoreSession } from "@/lib/api/client";

export function SessionProvider({ children }: { children: ReactNode }) {
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const restored = await restoreSession();
      if (!cancelled) {
        if (!restored) {
          useAuthStore.getState().logout();
        }
        hydrate();
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [hydrate]);

  return <>{children}</>;
}
