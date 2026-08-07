"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { History, Loader2 } from "lucide-react";

import { AuthGuard } from "@/components/layout/auth-guard";
import { TripHistory } from "@/components/profile/trip-history";
import { memoryApi, type Trip } from "@/lib/api/memory";

export default function MemoryPage() {
  const t = useTranslations("memory");
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    memoryApi
      .getHistory()
      .then((data) => {
        if (!cancelled) setTrips(data);
      })
      .catch(() => {
        if (!cancelled) setTrips([]);
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
          <History className="w-6 h-6 text-gold" />
          {t("title")}
        </h1>
        <p className="text-muted-foreground text-sm mb-8">{t("subtitle")}</p>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 animate-spin text-gold" />
          </div>
        ) : (
          <div className="bg-white dark:bg-nile rounded-2xl border border-sand/50 dark:border-nile-light/20 p-6">
            <h2 className="text-lg font-serif font-bold text-nile dark:text-sand mb-4">
              {t("history")}
            </h2>
            <TripHistory trips={trips} />
          </div>
        )}
      </div>
    </AuthGuard>
  );
}