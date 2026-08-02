"use client";

import { type ReactNode, useEffect } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";

export function SessionProvider({ children }: { children: ReactNode }) {
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return <>{children}</>;
}
