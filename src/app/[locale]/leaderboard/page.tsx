"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Trophy, Loader2, User } from "lucide-react";

import { leaderboardApi, type LeaderboardEntry } from "@/lib/api/leaderboard";

export default function LeaderboardPage() {
  const t = useTranslations("leaderboard");
  const pt = useTranslations("profile");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    leaderboardApi
      .get(50)
      .then((data) => {
        if (!cancelled) setEntries(data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const medal = (rank: number) => {
    if (rank === 1) return "text-[#C8831A]";
    if (rank === 2) return "text-slate-400";
    if (rank === 3) return "text-amber-700";
    return "text-muted-foreground";
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-serif font-bold text-nile dark:text-sand flex items-center gap-2 mb-2">
        <Trophy className="w-6 h-6 text-gold" />
        {t("title")}
      </h1>
      <p className="text-muted-foreground text-sm mb-8">{t("subtitle")}</p>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-gold" />
          <p className="text-sm text-muted-foreground">{t("loading")}</p>
        </div>
      ) : error ? (
        <p className="text-center text-sm text-muted-foreground py-16">
          {t("empty")}
        </p>
      ) : entries.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-16">
          {t("empty")}
        </p>
      ) : (
        <ol className="space-y-2">
          {entries.map((entry, i) => {
            const rank = i + 1;
            return (
              <li
                key={entry.id}
                className="flex items-center gap-4 p-4 rounded-xl border border-sand/50 dark:border-nile-light/20 bg-white dark:bg-nile"
              >
                <span className={`w-8 text-center font-bold text-lg flex-shrink-0 ${medal(rank)}`}>
                  {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : rank}
                </span>
                <div className="w-11 h-11 rounded-full bg-[#2E9C93]/12 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {entry.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={entry.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-[#2E9C93]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-nile dark:text-sand truncate">
                    {entry.displayName || "Traveler"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {pt("level")} {entry.level}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-bold text-[#C8831A]">{entry.xp.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">{t("xp")}</div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}