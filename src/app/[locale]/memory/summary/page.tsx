"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Sparkles, Loader2, CalendarRange } from "lucide-react";

import { AuthGuard } from "@/components/layout/auth-guard";
import { memoryApi, type InteractionSummary } from "@/lib/api/memory";

export default function MemorySummaryPage() {
  const t = useTranslations("memory");
  const [summary, setSummary] = useState<InteractionSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    memoryApi
      .getSummary()
      .then((data) => {
        if (!cancelled) setSummary(data);
      })
      .catch(() => {
        if (!cancelled) setSummary(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AuthGuard>
      <div className="min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-serif font-bold text-nile dark:text-sand flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-gold" />
          {t("summary")}
        </h1>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 animate-spin text-gold" />
          </div>
        ) : !summary ? (
          <p className="text-center text-muted-foreground text-sm py-24 max-w-md mx-auto">
            {t("noSummary")}
          </p>
        ) : (
          <div className="bg-white dark:bg-nile rounded-2xl border border-sand/50 dark:border-nile-light/20 p-6">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
              <CalendarRange className="w-4 h-4" />
              {t("period")}:{" "}
              {new Date(summary.periodStart).toLocaleDateString()} —{" "}
              {new Date(summary.periodEnd).toLocaleDateString()}
            </div>
            <p className="text-nile dark:text-sand leading-relaxed whitespace-pre-wrap">
              {summary.summary}
            </p>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}