"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Shield, RefreshCw, Loader2 } from "lucide-react";

import { AuthGuard } from "@/components/layout/auth-guard";
import { EventsList } from "@/components/safety/events-list";
import { SourceHealth } from "@/components/safety/source-health";
import { AiGuide } from "@/components/safety/ai-guide";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ErrorMessage } from "@/components/shared/error-message";
import { safetyApi, type CityRisk, type SafetyEvent, type SourceHealthEntry } from "@/lib/api/safety";
import { EGYPT_CITIES } from "@/lib/utils/constants";

const CITIES = [
  "Cairo", "Giza", "Alexandria", "Luxor", "Aswan",
  "Hurghada", "Sharm El Sheikh", "Dahab", "Marsa Alam",
  "Siwa Oasis", "El Gouna",
];

const CITY_COORDS: Record<string, { latitude: number; longitude: number }> = {
  "Cairo": { latitude: EGYPT_CITIES.cairo.lat, longitude: EGYPT_CITIES.cairo.lon },
  "Giza": { latitude: EGYPT_CITIES.giza.lat, longitude: EGYPT_CITIES.giza.lon },
  "Alexandria": { latitude: EGYPT_CITIES.alexandria.lat, longitude: EGYPT_CITIES.alexandria.lon },
  "Luxor": { latitude: EGYPT_CITIES.luxor.lat, longitude: EGYPT_CITIES.luxor.lon },
  "Aswan": { latitude: EGYPT_CITIES.aswan.lat, longitude: EGYPT_CITIES.aswan.lon },
  "Hurghada": { latitude: EGYPT_CITIES.hurghada.lat, longitude: EGYPT_CITIES.hurghada.lon },
  "Sharm El Sheikh": { latitude: EGYPT_CITIES.sharm_el_sheikh.lat, longitude: EGYPT_CITIES.sharm_el_sheikh.lon },
  "Dahab": { latitude: EGYPT_CITIES.dahab.lat, longitude: EGYPT_CITIES.dahab.lon },
  "Marsa Alam": { latitude: EGYPT_CITIES.marsa_alam.lat, longitude: EGYPT_CITIES.marsa_alam.lon },
  "Siwa Oasis": { latitude: EGYPT_CITIES.siwa_oasis.lat, longitude: EGYPT_CITIES.siwa_oasis.lon },
  "El Gouna": { latitude: EGYPT_CITIES.el_gouna.lat, longitude: EGYPT_CITIES.el_gouna.lon },
};

const CITY_DISPLAY: Record<string, string> = Object.fromEntries(
  Object.keys(CITY_COORDS).map((name) => [
    name.toLowerCase().replace(/[\s.-]+/g, "_"),
    name,
  ])
);

export default function SafetyPage() {
  return (
    <Suspense fallback={null}>
      <SafetyContent />
    </Suspense>
  );
}

function SafetyContent() {
  const t = useTranslations("safety");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawCity = searchParams.get("city") || "Cairo";
  const city = CITIES.includes(rawCity) ? rawCity : "Cairo";
  const [risk, setRisk] = useState<CityRisk | null>(null);
  const [sources, setSources] = useState<SourceHealthEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const handleCityChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("city", value);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [riskRes, sourcesRes] = await Promise.all([
          safetyApi.getRiskSummary(city),
          safetyApi.getSourceHealth(),
        ]);
        if (cancelled) return;
        setError(null);
        setRisk(riskRes.data);
        setSources(sourcesRes.data.sources || []);
      } catch (e) {
        if (cancelled) return;
        const message =
          e instanceof Error ? e.message : "Failed to load safety data";
        setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [city, retryKey]);

  const events = useMemo(() => {
    const source = risk?.events ?? [];
    const seen = new Set<string>();
    const out: SafetyEvent[] = [];
    for (const e of source) {
      const key = e.id || `${e.type}|${(e.location || "").toLowerCase()}|${e.title.toLowerCase()}`;
      if (seen.has(key)) continue;
      const location = e.location
        ? (CITY_DISPLAY[e.location.toLowerCase().replace(/[\s.-]+/g, "_")] ?? e.location)
        : undefined;
      seen.add(key);
      out.push({ ...e, location });
    }
    return out;
  }, [risk]);

  return (
    <AuthGuard>
      <div className="min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-serif font-bold text-nile dark:text-sand flex items-center gap-2">
              <Shield className="w-6 h-6 text-gold" />
              {t("title")}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{t("autoRefresh")}</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={city}
              onChange={(e) => handleCityChange(e.target.value)}
              className="px-3 py-2 rounded-lg border border-sand/60 dark:border-nile-light/40 bg-white dark:bg-nile-light text-nile dark:text-sand text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {loading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3" />
              )}
              {t("lastUpdated")}
            </div>
          </div>
        </div>

        {loading && !risk ? (
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
          <>
            {risk?.staticNote && (
              <div className="mb-6">
                <p className="text-sm text-muted-foreground bg-white dark:bg-nile border border-sand/50 dark:border-nile-light/20 rounded-xl p-4">
                  {typeof risk.staticNote === "string"
                    ? risk.staticNote
                    : risk.staticNote.headline ||
                      risk.staticNote.category ||
                      "Static safety note"}
                </p>
              </div>
            )}

            {risk && (
              <div className="mb-6">
                <AiGuide
                  city={city}
                  risk={risk}
                  coords={CITY_COORDS[city]}
                />
              </div>
            )}

            {/* Events */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-serif font-bold text-nile dark:text-sand">
                  {t("events")}
                </h2>
                <span className="text-xs text-muted-foreground">
                  {events.length} · {city}
                </span>
              </div>
              <div className="lg:max-h-[calc(100vh-18rem)] lg:overflow-y-auto pr-1">
                <EventsList events={events} />
              </div>
            </div>

            {/* Source Health */}
            <div className="mt-8">
              <h2 className="text-lg font-serif font-bold text-nile dark:text-sand mb-4">
                {t("sourceHealth")}
              </h2>
              <SourceHealth sources={sources} />
            </div>
          </>
        )}

      </div>
    </AuthGuard>
  );
}
