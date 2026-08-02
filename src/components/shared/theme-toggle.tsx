"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function ThemeToggle({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration guard
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="w-9 h-9" />;
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={cn(
        "relative p-2 rounded-lg border border-border hover:border-gold/50 bg-surface hover:bg-surface-hover transition-all duration-200 group",
        className
      )}
      aria-label="Toggle theme"
    >
      <div className="relative w-4 h-4">
        <Sun
          className={`absolute inset-0 w-4 h-4 transition-all duration-300 ${
            theme === "dark"
              ? "opacity-100 rotate-0 scale-100 text-gold-light"
              : "opacity-0 rotate-90 scale-75 text-muted"
          }`}
        />
        <Moon
          className={`absolute inset-0 w-4 h-4 transition-all duration-300 ${
            theme === "light"
              ? "opacity-100 rotate-0 scale-100 text-nile"
              : "opacity-0 -rotate-90 scale-75 text-muted"
          }`}
        />
      </div>
      <span className="sr-only">
        Switch to {theme === "dark" ? "light" : "dark"} mode
      </span>
    </button>
  );
}
