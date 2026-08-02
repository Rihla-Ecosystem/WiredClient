"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  Compass,
  ExternalLink,
  Loader2,
  MapPin,
  Navigation,
  Search,
  Ticket,
} from "lucide-react";

import { AuthGuard } from "@/components/layout/auth-guard";
import { MonumentCard } from "@/components/explore/monument-card";
import { TicketMap } from "@/components/tickets/ticket-map";
import { EmptyState } from "@/components/shared/empty-state";
import { geoApi, type GeoRoute } from "@/lib/api/geo";
import {
  egymonumentsApi,
  type Monument,
} from "@/lib/api/egymonuments";

const DEFAULT_LOCATION = { latitude: 30.0444, longitude: 31.2357 };

const CATEGORY_FILTERS = ["archaeological", "islamic", "christian"] as const;

export default function TicketsPage() {
  const t = useTranslations("tickets");
  const [monuments, setMonuments] = useState<Monument[] | null>(null);
  const [search, setSearch] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [category, setCategory] = useState("");
  const [selected, setSelected] = useState<Monument | null>(null);
  const [start, setStart] = useState<typeof DEFAULT_LOCATION | null>(null);
  const [route, setRoute] = useState<GeoRoute | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);

  useEffect(() => {
    let active = true;
    egymonumentsApi
      .getMonuments()
      .then((data) => {
        if (active) setMonuments(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!("geolocation" in navigator)) {
        setStart(DEFAULT_LOCATION);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setStart({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        () => setStart(DEFAULT_LOCATION),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!selected || !start) return;
    let active = true;
    const timer = setTimeout(async () => {
      setRouteLoading(true);
      setRoute(null);
      try {
        const r = await geoApi.getRoute(start, {
          latitude: selected.latitude,
          longitude: selected.longitude,
        });
        if (active) setRoute(r);
      } catch {
        if (active) setRoute(null);
      } finally {
        if (active) setRouteLoading(false);
      }
    }, 0);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [selected, start]);

  const governorates = useMemo(() => {
    if (!monuments) return [];
    const set = new Set<string>();
    for (const m of monuments) if (m.governorate) set.add(m.governorate);
    return [...set].sort();
  }, [monuments]);

  const filtered = useMemo(() => {
    if (!monuments) return [];
    const term = search.trim().toLowerCase();
    return monuments.filter((m) => {
      if (category && m.category !== category) return false;
      if (governorate && m.governorate !== governorate) return false;
      if (
        term &&
        !m.title.toLowerCase().includes(term) &&
        !(m.city || "").toLowerCase().includes(term)
      ) {
        return false;
      }
      return true;
    });
  }, [monuments, search, category, governorate]);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setStart({ latitude: lat, longitude: lng });
  }, []);

  const price = (value: number | null | undefined): string =>
    value == null ? t("na") : `LE ${value}`;

  const detail = selected && (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-serif font-bold text-nile dark:text-sand text-lg leading-tight">
            {selected.title}
          </h2>
          {(selected.city || selected.governorate) && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" />
              {[selected.city, selected.governorate].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full font-medium capitalize bg-gold/10 text-gold border border-gold/30 flex-shrink-0">
          {selected.category}
        </span>
      </div>

      {selected.images[0] && (
        <Image
          src={selected.images[0]}
          alt={selected.title}
          width={640}
          height={300}
          unoptimized
          className="rounded-xl object-cover bg-sand/20 dark:bg-nile-light/20 w-full h-44"
        />
      )}

      {selected.description && (
        <p className="text-sm text-muted-foreground leading-relaxed">
          {selected.description}
        </p>
      )}

      <div className="rounded-xl bg-gold/5 dark:bg-gold/10 border border-gold/20 p-4">
        <div className="flex items-center gap-1.5 text-sm font-medium text-gold mb-2">
          <Ticket className="w-4 h-4" />
          {t("prices")}
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div>
            <div className="text-xs text-muted-foreground">{t("egyptian")}</div>
            <div className="mt-0.5">
              {t("adult")}{" "}
              <span className="font-semibold text-nile dark:text-sand">
                {price(selected.prices.egyptian?.adult)}
              </span>{" "}
              · {t("student")}{" "}
              <span className="font-semibold text-nile dark:text-sand">
                {price(selected.prices.egyptian?.student)}
              </span>
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">{t("foreigner")}</div>
            <div className="mt-0.5">
              {t("adult")}{" "}
              <span className="font-semibold text-nile dark:text-sand">
                {price(selected.prices.foreigner?.adult)}
              </span>{" "}
              · {t("student")}{" "}
              <span className="font-semibold text-nile dark:text-sand">
                {price(selected.prices.foreigner?.student)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {(selected.opening_hours.summer ||
        selected.opening_hours.winter ||
        selected.opening_hours.ramadan) && (
        <div className="space-y-1 text-sm">
          <div className="text-xs text-muted-foreground">{t("openingHours")}</div>
          {selected.opening_hours.summer && (
            <div>
              <span className="font-medium text-nile dark:text-sand">
                {t("hoursSummer")}
              </span>
              <span className="text-muted-foreground">
                : {selected.opening_hours.summer}
              </span>
            </div>
          )}
          {selected.opening_hours.winter && (
            <div>
              <span className="font-medium text-nile dark:text-sand">
                {t("hoursWinter")}
              </span>
              <span className="text-muted-foreground">
                : {selected.opening_hours.winter}
              </span>
            </div>
          )}
          {selected.opening_hours.ramadan && (
            <div>
              <span className="font-medium text-nile dark:text-sand">
                {t("hoursRamadan")}
              </span>
              <span className="text-muted-foreground">
                : {selected.opening_hours.ramadan}
              </span>
            </div>
          )}
        </div>
      )}

      <a
        href={selected.url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gold text-white text-sm font-medium hover:bg-gold/90 transition-colors"
      >
        <ExternalLink className="w-4 h-4" />
        {t("buyTickets")}
      </a>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-nile dark:text-sand flex items-center gap-1.5">
            <Navigation className="w-4 h-4 text-gold" />
            {t("directions")}
          </h3>
          {routeLoading && (
            <Loader2 className="w-4 h-4 animate-spin text-gold" />
          )}
          {route && !routeLoading && (
            <span className="text-xs text-muted-foreground">
              {(route.distanceMeters / 1000).toFixed(1)} km ·{" "}
              {Math.round(route.durationSeconds / 60)} min
            </span>
          )}
        </div>
        <TicketMap
          monument={selected}
          start={start}
          route={route}
          onMapClick={handleMapClick}
        />
        <p className="text-[11px] text-muted-foreground mt-1.5">
          {t("setStartHint")}
        </p>
      </div>
    </div>
  );

  return (
    <AuthGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-[calc(100vh-4rem)]">
        <div className="flex items-center justify-between gap-3 flex-wrap flex-none">
          <div>
            <h1 className="text-xl font-serif font-bold text-nile dark:text-sand flex items-center gap-2">
              <Ticket className="w-5 h-5 text-gold" />
              {t("title")}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
          </div>
          <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-gold/10 text-gold border border-gold/30">
            <Compass className="w-3.5 h-3.5" />
            {monuments ? monuments.length : "…"} {t("monuments")}
          </div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-3 flex-none">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full pl-9 pr-3 py-2 rounded-lg text-sm bg-white dark:bg-nile border border-sand/50 dark:border-nile-light/20 focus:border-gold/60 focus:outline-none"
            />
          </div>
          <select
            value={governorate}
            onChange={(e) => setGovernorate(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm bg-white dark:bg-nile border border-sand/50 dark:border-nile-light/20 focus:border-gold/60 focus:outline-none"
          >
            <option value="">{t("allGovernorates")}</option>
            {governorates.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3 flex items-center gap-2 flex-wrap flex-none">
          <button
            type="button"
            onClick={() => setCategory("")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              !category
                ? "bg-gold text-white"
                : "bg-sand/40 dark:bg-nile-light/20 text-muted-foreground hover:bg-sand/70 dark:hover:bg-nile-light/30"
            }`}
          >
            {t("all")}
          </button>
          {CATEGORY_FILTERS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(category === c ? "" : c)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                category === c
                  ? "bg-gold text-white"
                  : "bg-sand/40 dark:bg-nile-light/20 text-muted-foreground hover:bg-sand/70 dark:hover:bg-nile-light/30"
              }`}
            >
              {t(c)}
            </button>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px] items-start">
          <div className="min-h-0 overflow-y-auto h-[45vh] lg:max-h-[calc(100vh-15rem)] lg:sticky lg:top-20 pr-1 -mr-1">
            {!monuments ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="w-6 h-6 animate-spin text-gold" />
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={<Ticket className="w-6 h-6 text-gold" />}
                title={t("noResults")}
                description={t("noResultsHint")}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((m) => (
                  <MonumentCard
                    key={m.id}
                    monument={m}
                    selected={selected?.id === m.id}
                    onSelect={setSelected}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl bg-white dark:bg-nile border border-sand/50 dark:border-nile-light/20 p-5 min-h-[280px]">
            {detail ? (
              detail
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 text-center py-12">
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
                  <Ticket className="w-6 h-6 text-gold" />
                </div>
                <p className="text-sm text-muted-foreground max-w-[220px]">
                  {t("selectHint")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
