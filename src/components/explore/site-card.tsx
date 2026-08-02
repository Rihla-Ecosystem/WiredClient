"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  CheckSquare,
  ExternalLink,
  MapPin,
  Navigation,
  Square,
  Ticket,
} from "lucide-react";
import type { Site } from "@/lib/types";
import type { Monument } from "@/lib/api/egymonuments";

interface SiteCardProps {
  site: Site;
  distanceKm?: number;
  selected?: boolean;
  onSelect?: (site: Site) => void;
  onNavigate?: (site: Site) => void;
  selectable?: boolean;
  selectedForTrip?: boolean;
  onToggleSelect?: (site: Site) => void;
  ticket?: Monument | null;
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

export function SiteCard({
  site,
  distanceKm,
  selected,
  onSelect,
  onNavigate,
  selectable,
  selectedForTrip,
  onToggleSelect,
  ticket,
}: SiteCardProps) {
  const t = useTranslations("explore");
  const style = CATEGORY_STYLE[site.category] || DEFAULT_STYLE;
  const image = site.images[0];

  const price = (value: number | null | undefined): string =>
    value == null ? t("na") : `LE ${value}`;

  return (
    <div
      onClick={() => onSelect?.(site)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect?.(site);
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
            alt={site.name}
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
          {site.category}
        </span>
        {selectable && onToggleSelect && (
          <button
            type="button"
            aria-label="Select for trip"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect(site);
            }}
            className={`absolute top-3 right-3 flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-sm transition-colors ${
              selectedForTrip
                ? "bg-gold text-white"
                : "bg-white/90 dark:bg-nile/90 text-muted-foreground backdrop-blur-sm hover:bg-sand/90 dark:hover:bg-nile-light/90"
            }`}
          >
            {selectedForTrip ? (
              <CheckSquare className="w-3.5 h-3.5" />
            ) : (
              <Square className="w-3.5 h-3.5" />
            )}
            Trip
          </button>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-serif font-semibold text-nile dark:text-sand truncate">
              {site.name}
            </h3>
            {site.nameAr && (
              <p
                className="text-xs text-muted-foreground font-arabic mt-0.5"
                dir="rtl"
              >
                {site.nameAr}
              </p>
            )}
          </div>
          {distanceKm !== undefined && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0 mt-0.5">
              <Navigation className="w-3 h-3" />
              {distanceKm < 1
                ? `${Math.round(distanceKm * 1000)} m`
                : `${distanceKm.toFixed(1)} km`}
            </div>
          )}
        </div>

        {site.governorate && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{site.governorate}</span>
          </p>
        )}

        {ticket && (
          <div className="mt-3 rounded-lg bg-gold/5 border border-gold/20 p-2.5 text-xs">
            <div className="flex items-center gap-1.5 font-medium text-gold mb-1.5">
              <Ticket className="w-3.5 h-3.5" />
              {t("ticketsAvailable")}
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-muted-foreground">
              <span>{t("egyptian")}</span>
              <span>
                {t("adult")} {price(ticket.prices.egyptian?.adult)} ·{" "}
                {t("student")} {price(ticket.prices.egyptian?.student)}
              </span>
              <span>{t("foreigner")}</span>
              <span>
                {t("adult")} {price(ticket.prices.foreigner?.adult)} ·{" "}
                {t("student")} {price(ticket.prices.foreigner?.student)}
              </span>
            </div>
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-sand/50 dark:border-nile-light/20 flex items-center justify-between gap-2">
          {onNavigate ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(site);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold py-1.5 px-3 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5" />
              {t("directions")}
            </button>
          ) : (
            <span />
          )}
          {ticket?.url && (
            <a
              href={ticket.url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {t("buyTickets")}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
