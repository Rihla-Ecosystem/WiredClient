"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { User, Loader2, Compass, CheckCircle2 } from "lucide-react";
import Link from "next/link";

import { AuthGuard } from "@/components/layout/auth-guard";
import { ProfileCard } from "@/components/profile/profile-card";
import { BadgesGrid } from "@/components/profile/badges-grid";
import { TripHistory } from "@/components/profile/trip-history";
import { useAuthStore } from "@/lib/stores/auth-store";
import { authApi } from "@/lib/api/auth";
import { coreClient } from "@/lib/api/client";
import { journeysApi, type Journey } from "@/lib/api/journeys";

interface Badge {
  id: string;
  name: string;
  icon: string;
  earnedAt: string;
}

interface Trip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  type: string;
  sites: number;
}

interface TripRecord {
  id: string;
  title?: string | null;
  destination?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  notes?: string | null;
}

export default function ProfilePage() {
  const t = useTranslations("profile");
  const user = useAuthStore((s) => s.user);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [quests, setQuests] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const [badgesRes, tripsRes, questsRes] = await Promise.all([
          authApi.getBadges(user.id).catch(() => ({ data: [] })),
          coreClient
            .get<TripRecord[]>("/memory/history")
            .catch(() => ({ data: [] })),
          journeysApi.list().catch(() => ({ data: [] as Journey[] })),
        ]);
        if (cancelled) return;
        setBadges(
          (badgesRes.data || []).map((b) => ({
            id: String(b.id),
            name: b.name,
            icon: b.iconUrl || "🏆",
            earnedAt: "",
          }))
        );
        setTrips(
          (tripsRes.data || []).map((tr) => ({
            id: tr.id,
            destination: tr.destination || tr.title || "Trip",
            startDate: tr.startDate
              ? new Date(tr.startDate).toLocaleDateString()
              : "",
            endDate: tr.endDate
              ? new Date(tr.endDate).toLocaleDateString()
              : "",
            type: tr.notes || "Journey",
            sites: 0,
          }))
        );
        setQuests(questsRes.data || []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  return (
    <AuthGuard>
      <div className="min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-serif font-bold text-nile dark:text-sand flex items-center gap-2 mb-8">
          <User className="w-6 h-6 text-gold" />
          {t("title")}
        </h1>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 animate-spin text-gold" />
          </div>
        ) : (
          <div className="space-y-6">
            <ProfileCard />

            <div className="bg-white dark:bg-nile rounded-2xl border border-sand/50 dark:border-nile-light/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-serif font-bold text-nile dark:text-sand flex items-center gap-2">
                  <Compass className="w-5 h-5 text-gold" />
                  {t("journeys")}
                </h2>
                <Link
                  href="/quests"
                  className="text-sm text-gold hover:underline"
                >
                  {t("title")}
                </Link>
              </div>
              {quests.length === 0 ? (
                <p className="text-sm text-muted-foreground">
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
                        className="block rounded-xl border border-sand/50 dark:border-nile-light/20 p-4 hover:border-gold/50 transition-colors"
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

            <div className="bg-white dark:bg-nile rounded-2xl border border-sand/50 dark:border-nile-light/20 p-6">
              <h2 className="text-lg font-serif font-bold text-nile dark:text-sand mb-4 flex items-center gap-2">
                <span className="text-gold">{t("badges")}</span>
              </h2>
              <BadgesGrid badges={badges} />
            </div>

            <div className="bg-white dark:bg-nile rounded-2xl border border-sand/50 dark:border-nile-light/20 p-6">
              <h2 className="text-lg font-serif font-bold text-nile dark:text-sand mb-4">
                {t("tripHistory")}
              </h2>
              <TripHistory trips={trips} />
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
