"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Compass, Shield, CheckCircle2, MapPin } from "lucide-react";
import { AuthGuard } from "@/components/layout/auth-guard";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ErrorMessage } from "@/components/shared/error-message";
import { journeysApi, type Journey } from "@/lib/api/journeys";
import { cn } from "@/lib/utils/cn";

const SCAM_SLUGS = [
  "scam-smart-traveler",
  "taxi-tricks",
  "street-money-exchange",
  "fake-guide-papyrus",
  "atm-card-scam",
];

const ARCHAEOLOGY_SLUGS = [
  "giza-plateau",
  "karnak-luxor",
  "abu-simbel-nubia",
  "coptic-islamic-cairo",
];

function QuestCard({ quest }: { quest: Journey }) {
  const t = useTranslations("quests");
  const pct =
    quest.totalSteps > 0
      ? Math.round((quest.completedSteps / quest.totalSteps) * 100)
      : 0;

  return (
    <Link
      href={`/quests/${quest.slug}`}
      className={cn(
        "block rounded-2xl border p-5 transition-all duration-200",
        quest.isCompleted
          ? "bg-emerald-50/60 dark:bg-emerald-900/20 border-emerald-200/70 dark:border-emerald-800/40"
          : "bg-white dark:bg-nile border-sand/50 dark:border-nile-light/20 hover:border-gold/50 hover:shadow-md"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-serif font-bold text-nile dark:text-sand flex items-center gap-2">
            {quest.title}
            {quest.isCompleted && (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            )}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {quest.description}
          </p>
        </div>
        <div className="shrink-0">
          {quest.isCompleted ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
              {t("completed")}
            </span>
          ) : quest.completedSteps > 0 ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gold/15 text-gold text-xs font-medium">
              {t("inProgress")}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-sand/60 dark:bg-nile-light/40 text-muted-foreground text-xs font-medium">
              {t("notStarted")}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
          <span>
            {quest.completedSteps} {t("of")} {quest.totalSteps} {t("steps")}
          </span>
          <span className="flex items-center gap-1 text-gold font-medium">
            +{quest.xpReward} XP
          </span>
        </div>
        <div className="h-2 rounded-full bg-sand/50 dark:bg-nile-light/40 overflow-hidden">
          <div
            className="h-full rounded-full gradient-gold transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </Link>
  );
}

export default function QuestsPage() {
  const t = useTranslations("quests");
  const [quests, setQuests] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await journeysApi.list();
        if (cancelled) return;
        setError(null);
        setQuests(res.data || []);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load quests");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [retryKey]);

  const scamQuests = SCAM_SLUGS.map((slug) =>
    quests.find((q) => q.slug === slug)
  ).filter((q): q is Journey => Boolean(q));
  const archaeologyQuests = ARCHAEOLOGY_SLUGS.map((slug) =>
    quests.find((q) => q.slug === slug)
  ).filter((q): q is Journey => Boolean(q));

  return (
    <AuthGuard>
      <div className="min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8 max-w-5xl mx-auto pb-24 md:pb-8">
        <div className="mb-8">
          <h1 className="text-2xl font-serif font-bold text-nile dark:text-sand flex items-center gap-2">
            <Compass className="w-6 h-6 text-gold" />
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
        </div>

        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <ErrorMessage
              message={error}
              onRetry={() => setRetryKey((k) => k + 1)}
            />
          </div>
        ) : (
          <div className="space-y-10">
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-gold" />
                <div>
                  <h2 className="text-lg font-serif font-bold text-nile dark:text-sand">
                    {t("scamTitle")}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {t("scamSubtitle")}
                  </p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {scamQuests.map((q) => (
                  <QuestCard key={q.id} quest={q} />
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-gold" />
                <div>
                  <h2 className="text-lg font-serif font-bold text-nile dark:text-sand">
                    {t("archaeologyTitle")}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {t("archaeologySubtitle")}
                  </p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {archaeologyQuests.map((q) => (
                  <QuestCard key={q.id} quest={q} />
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
