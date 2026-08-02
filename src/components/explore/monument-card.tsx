"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Clock, ExternalLink, MapPin, Ticket } from "lucide-react";
import type { Monument } from "@/lib/api/egymonuments";

interface MonumentCardProps {
  monument: Monument;
  selected?: boolean;
  onSelect?: (monument: Monument) => void;
}

const CATEGORY_STYLE: Record<
  string,
  { accent: string; badge: string; emoji: string }
> = {
  archaeological: {
    accent: "from-amber-500/30 via-amber-400/10 to-transparent",
    badge: "bg-amber-950/70 text-amber-100 backdrop-blur-sm",
    emoji: "🏛️",
  },
  islamic: {
    accent: "from-emerald-500/30 via-emerald-400/10 to-transparent",
    badge: "bg-emerald-950/70 text-emerald-100 backdrop-blur-sm",
    emoji: "🕌",
  },
  christian: {
    accent: "from-blue-500/30 via-blue-400/10 to-transparent",
    badge: "bg-blue-950/70 text-blue-100 backdrop-blur-sm",
    emoji: "⛪",
  },
  infrastructure: {
    accent: "from-purple-500/30 via-purple-400/10 to-transparent",
    badge: "bg-purple-950/70 text-purple-100 backdrop-blur-sm",
    emoji: "🏗️",
  },
};

const DEFAULT_STYLE = {
  accent: "from-sand/40 via-sand/10 to-transparent",
  badge: "bg-nile/70 text-sand backdrop-blur-sm",
  emoji: "📍",
};

export function MonumentCard({
  monument,
  selected,
  onSelect,
}: MonumentCardProps) {
  const t = useTranslations("explore");
  const style = CATEGORY_STYLE[monument.category] || DEFAULT_STYLE;
  const image = monument.images[0];
  const hours = monument.opening_hours;
  const location = [monument.city, monument.governorate]
    .filter(Boolean)
    .join(" · ");

  const price = (value: number | null | undefined): string =>
    value == null ? t("na") : `LE ${value}`;

  return (
    <div
      onClick={() => onSelect?.(monument)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect?.(monument);
        }
      }}
      className={`group w-full text-left rounded-xl bg-white dark:bg-nile border overflow-hidden transition-all cursor-pointer hover:shadow-md ${
        selected
          ? "border-gold/60 ring-2 ring-gold/30"
          : "border-sand/50 dark:border-nile-light/20 hover:border-gold/40"
      }`}
    >
      <div className="relative aspect-video overflow-hidden bg-sand/20 dark:bg-nile-light/20">
        {image ? (
          <Image
            src={image}
            alt={monument.title}
            fill
            unoptimized
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className={`absolute inset-0 bg-gradient-to-br ${style.accent}`}
          >
            <span className="absolute inset-0 flex items-center justify-center text-5xl opacity-80">
              {style.emoji}
            </span>
          </div>
        )}
        {selected && (
          <div className="absolute inset-0 ring-2 ring-gold/40 ring-inset" />
        )}
        <span
          className={`absolute top-3 left-3 text-[11px] px-2 py-0.5 rounded-full font-medium capitalize shadow-sm ${style.badge}`}
        >
          {monument.category}
        </span>
      </div>

      <div className="p-4">
        <h3 className="font-serif font-semibold text-nile dark:text-sand truncate">
          {monument.title}
        </h3>
        {location && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{location}</span>
          </p>
        )}

        <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-gold">
          <Ticket className="w-3.5 h-3.5" />
          {t("ticketsAvailable")}
        </div>
        <div className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          <span>{t("egyptian")}</span>
          <span>
            {t("adult")} {price(monument.prices.egyptian?.adult)} ·{" "}
            {t("student")} {price(monument.prices.egyptian?.student)}
          </span>
          <span>{t("foreigner")}</span>
          <span>
            {t("adult")} {price(monument.prices.foreigner?.adult)} ·{" "}
            {t("student")} {price(monument.prices.foreigner?.student)}
          </span>
        </div>

        {(hours.summer || hours.winter || hours.ramadan) && (
          <div className="mt-2.5 pt-2.5 border-t border-sand/50 dark:border-nile-light/20 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
            {hours.summer && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 flex-shrink-0" />
                {t("hoursSummer")}: {hours.summer}
              </span>
            )}
            {hours.winter && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 flex-shrink-0" />
                {t("hoursWinter")}: {hours.winter}
              </span>
            )}
            {hours.ramadan && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 flex-shrink-0" />
                {t("hoursRamadan")}: {hours.ramadan}
              </span>
            )}
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-sand/50 dark:border-nile-light/20 flex items-center justify-between">
          <a
            href={monument.url}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold hover:underline"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            {t("buyTickets")}
          </a>
          {onSelect && (
            <span className="text-xs text-muted-foreground transition-transform group-hover:translate-x-0.5">
              {t("viewDetails")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
