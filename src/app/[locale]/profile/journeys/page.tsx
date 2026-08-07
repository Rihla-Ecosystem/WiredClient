"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Compass, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

import { AuthGuard } from "@/components/layout/auth-guard";
import { TripHistory } from "@/components/profile/trip-history";
import { memoryApi, type Trip } from "@/lib/api/memory";
import { journeysApi, type Journey } from "@/lib/api/journeys";

type Tab = "history" | "quests";

export default function ProfileJourneysPage() {
  const t = useTranslations("profile");
  const [tab, setTab] = useState<Tab>("history");
  const [trips, setTrips] = useState<Trip[]>([]);
  const [quests, setQuests] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [tripsRes, questsRes] = await Promise.all([
          memoryApi.getHistory().catch(() => []),
          journeysApi.list().catch(() => ({ data: [] as Journey[] })),
        ]);
        if (cancelled) return;
        setTrips(tripsRes);
        setQuests(questsRes.data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AuthGuard>
      <div className="min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-serif font-bold text-nile dark:text-sand flex items-center gap-2 mb-6">
          <Compass className="w-6 h-6 text-gold" />
          {t("journeys")}
        </h1>

        <div className="flex gap-2 mb-6">
          {(["history", "quests"] as Tab[]).map((tabs) => (
            <button
              key={tabs}
              type="button"
              onClick={() => setTab(tabs)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === tabs
                  ? "bg-[#2E9C93] text-white"
                  : "bg-white dark:bg-nile text-muted-foreground border border-sand/50 dark:border-nile-light/20 hover:text-nile dark:hover:text-sand"
              }`}
            >
              {tabs === "history" ? t("historyTab") : t("questsTab")}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 animate-spin text-gold" />
          </div>
        ) : tab === "history" ? (
          <div className="bg-white dark:bg-nile rounded-2xl border border-sand/50 dark:border-nile-light/20 p-6">
            <h2 className="text-lg font-serif font-bold text-nile dark:text-sand mb-4">
              {t("tripHistory")}
            </h2>
            <TripHistory trips={trips} />
          </div>
        ) : quests.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-16">
            {t("noQuests")}
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {quests.map((q) => {
              const pct =
                q.totalSteps > 0
                  ? Math.round((q.completedSteps / q.totalSteps) * 100)
                  : 0;
              return (
                <Link
                  key={q.id}
                  href={`/quests/${q.slug}`}
                  className="block rounded-xl border border-sand/50 dark:border-nile-light/20 bg-white dark:bg-nile p-4 hover:border-gold/50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-nile dark:text-sand truncate">
                      {q.title}
                    </span>
                    {q.isCompleted && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    )}
                  </div>
                  <div className="mt-2.5 flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-sand/50 dark:bg-nile-light/40 overflow-hidden">
                      <div
                        className="h-full rounded-full gradient-gold"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {q.completedSteps}/{q.totalSteps}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}