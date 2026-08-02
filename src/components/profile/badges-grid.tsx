"use client";

import { useTranslations } from "next-intl";
import { Award } from "lucide-react";

interface Badge {
  id: string;
  name: string;
  icon: string;
  earnedAt: string;
}

interface BadgesGridProps {
  badges: Badge[];
}

export function BadgesGrid({ badges }: BadgesGridProps) {
  const t = useTranslations("profile");

  if (badges.length === 0) {
    return (
      <div className="text-center py-8">
        <Award className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
        <p className="text-sm text-muted-foreground">{t("noBadges")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
      {badges.map((badge) => (
        <div
          key={badge.id}
          className="flex flex-col items-center p-3 rounded-xl bg-sand/20 dark:bg-nile border border-sand/30 dark:border-nile-light/20"
        >
          <span className="text-2xl mb-1">{badge.icon}</span>
          <span className="text-xs text-muted-foreground text-center leading-tight">
            {badge.name}
          </span>
        </div>
      ))}
    </div>
  );
}
