"use client";

import { usePathname, useRouter } from "next/navigation";
import { useUIStore } from "@/lib/stores/ui-store";
import { Languages } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function LanguageSwitcher({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { locale, setLocale } = useUIStore();

  const toggleLocale = () => {
    const newLocale = locale === "en" ? "ar" : "en";
    setLocale(newLocale);
    const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPathname);
  };

  return (
    <button
      onClick={toggleLocale}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium text-gray-600 dark:text-gray-400",
        className
      )}
      aria-label="Toggle language"
    >
      <Languages className="w-4 h-4" />
      <span>{locale === "en" ? "AR" : "EN"}</span>
    </button>
  );
}
