"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Award, Loader2 } from "lucide-react";

import { AuthGuard } from "@/components/layout/auth-guard";
import { BadgesGrid } from "@/components/profile/badges-grid";
import { useAuthStore } from "@/lib/stores/auth-store";
import { authApi } from "@/lib/api/auth";

interface Badge {
  id: string;
  name: string;
  icon: string;
  earnedAt: string;
}

export default function ProfileBadgesPage() {
  const t = useTranslations("profile");
  const user = useAuthStore((s) => s.user);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    authApi
      .getBadges(user.id)
      .then(({ data }) => {
        if (cancelled) return;
        setBadges(
          (data || []).map((b) => ({
            id: String(b.id),
            name: b.name,
            icon: b.iconUrl || "🏆",
            earnedAt: "",
          }))
        );
      })
      .catch(() => {
        if (!cancelled) setBadges([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  return (
    <AuthGuard>
      <div className="min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-serif font-bold text-nile dark:text-sand flex items-center gap-2 mb-8">
          <Award className="w-6 h-6 text-gold" />
          {t("badges")}
        </h1>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 animate-spin text-gold" />
          </div>
        ) : (
          <div className="bg-white dark:bg-nile rounded-2xl border border-sand/50 dark:border-nile-light/20 p-6">
            <BadgesGrid badges={badges} />
          </div>
        )}
      </div>
    </AuthGuard>
  );
}