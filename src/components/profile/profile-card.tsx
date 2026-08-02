"use client";

import { useTranslations } from "next-intl";
import { Globe, Calendar } from "lucide-react";

import { useAuthStore } from "@/lib/stores/auth-store";

export function ProfileCard() {
  const t = useTranslations("profile");
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  return (
    <div className="bg-white dark:bg-nile rounded-2xl border border-sand/50 dark:border-nile-light/20 p-6 md:p-8">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar */}
        <div className="w-24 h-24 rounded-full bg-gold/10 flex items-center justify-center text-3xl font-serif font-bold text-gold border-2 border-gold/30 flex-shrink-0">
          {user.displayName.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl font-serif font-bold text-nile dark:text-sand">
            {user.displayName}
          </h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>

          <div className="flex flex-wrap gap-4 mt-4 justify-center sm:justify-start">
            {user.nationality && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Globe className="w-3.5 h-3.5" />
                {user.nationality}
              </span>
            )}
            {user.gender && (
              <span className="text-xs text-muted-foreground">
                {user.gender === "MALE" ? "Male" : "Female"}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              {t("joinDate")}: {new Date(user.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center gap-4 mt-4 justify-center sm:justify-start">
            <div className="text-center">
              <div className="text-2xl font-bold text-gold">{user.level}</div>
              <div className="text-xs text-muted-foreground">{t("level")}</div>
            </div>
            <div className="w-px h-10 bg-sand/50 dark:bg-nile-light/30" />
            <div className="text-center">
              <div className="text-2xl font-bold text-gold">{user.xp}</div>
              <div className="text-xs text-muted-foreground">XP</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
