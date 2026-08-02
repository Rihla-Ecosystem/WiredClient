"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  LocateFixed,
  Loader2,
  MapPin,
  Navigation,
  Route as RouteIcon,
  Ticket,
  X,
} from "lucide-react";

import { AuthGuard } from "@/components/layout/auth-guard";
import { MapView } from "@/components/explore/map-view";
import { SiteCard } from "@/components/explore/site-card";
import { MonumentCard } from "@/components/explore/monument-card";
import { SearchBar } from "@/components/explore/search-bar";
import { EmptyState } from "@/components/shared/empty-state";
import {
  geoApi,
  HERITAGE_CATEGORIES,
  type GeoJsonGeometry,
  type GeoRoute,
  type Governorate,
  type TripPlan,
} from "@/lib/api/geo";
import {
  buildMonumentLookup,
  egymonumentsApi,
  normalizeName,
  type Monument,
} from "@/lib/api/egymonuments";
import type { Site } from "@/lib/types";

const RADIUS_OPTIONS = [1000, 2000, 5000, 10000, 25000] as const;

const ALL_CATEGORIES = [...HERITAGE_CATEGORIES, "infrastructure"];

const MAX_TRIP_STOPS = 12;

const DEFAULT_LOCATION = { latitude: 30.0444, longitude: 31.2357 };

const CITY_TO_GOVERNORATE: Record<string, string> = {
  cairo: "Cairo",
  giza: "Giza",
  alexandria: "Alexandria",
  luxor: "Luxor",
  aswan: "Aswan",
  mansoura: "Dakahlia",
  fayoum: "Faiyum",
  siwa: "Matrouh",
  "abu simbel": "Aswan",
  hurghada: "Red Sea",
  "sharm el sheikh": "South Sinai",
  dahab: "South Sinai",
  "marsa alam": "Red Sea",
  "el gouna": "Red Sea",
  "port said": "Port Said",
};

type LocationStatus = "idle" | "locating" | "granted" | "denied";

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function ExplorePage() {
  const t = useTranslations("explore");
  const [search, setSearch] = useState("");
  const [radius, setRadius] = useState<number>(5000);
  const [userLocation, setUserLocation] = useState<typeof DEFAULT_LOCATION | null>(null);
  const [pin, setPin] = useState<typeof DEFAULT_LOCATION | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [countryOutline, setCountryOutline] =
    useState<GeoJsonGeometry | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [route, setRoute] = useState<GeoRoute | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [center, setCenter] = useState<[number, number]>([
    DEFAULT_LOCATION.latitude,
    DEFAULT_LOCATION.longitude,
  ]);
  const [zoom, setZoom] = useState(12);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [governorates, setGovernorates] = useState<Governorate[]>([]);
  const [governorate, setGovernorate] = useState("");
  const [category, setCategory] = useState("");

  const [tripSelection, setTripSelection] = useState<Set<string>>(new Set());
  const [tripPlan, setTripPlan] = useState<TripPlan | null>(null);
  const [tripLoading, setTripLoading] = useState(false);

  const [ticketsEnabled, setTicketsEnabled] = useState(false);
  const [monuments, setMonuments] = useState<Monument[] | null>(null);
  const [selectedMonument, setSelectedMonument] = useState<Monument | null>(null);

  const searchActive = search.trim().length > 0;

  useEffect(() => {
    geoApi
      .getGovernorates()
      .then((data) => setGovernorates(data))
      .catch(() => setGovernorates([]));
  }, []);

  useEffect(() => {
    geoApi
      .getCountryBoundary()
      .then(setCountryOutline)
      .catch(() => setCountryOutline(null));
  }, []);

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
    const params = new URLSearchParams(window.location.search);
    const city = params.get("city");
    if (!city) return;
    const gov = CITY_TO_GOVERNORATE[city.trim().toLowerCase()];
    if (!gov) return;
    const timer = setTimeout(() => setGovernorate(gov), 0);
    return () => clearTimeout(timer);
  }, []);

  const reload = useCallback(async () => {
    setSelectedSite(null);
    setRoute(null);
    setTripPlan(null);
    setSelectedMonument(null);
    if (search.trim()) {
      setSearching(true);
      try {
        const results = await geoApi.search(search.trim(), {
          category: category || undefined,
          limit: 50,
        });
        setError(null);
        setSites(results);
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Search failed";
        setError(message);
        setSites([]);
      } finally {
        setSearching(false);
      }
      return;
    }
    if (governorate) {
      setLoading(true);
      try {
        const data = await geoApi.getSitesByGovernorate(
          governorate,
          category || undefined,
          300
        );
        setError(null);
        setSites(data);
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Failed to load sites";
        setError(message);
        setSites([]);
      } finally {
        setLoading(false);
      }
      return;
    }
    const origin = pin ?? userLocation;
    if (!origin) return;
    setLoading(true);
    try {
      const cats = category ? [category] : ALL_CATEGORIES;
      const data = await geoApi.getNearbySites(
        origin.latitude,
        origin.longitude,
        radius,
        cats
      );
      setError(null);
      setSites(data);
      setCenter([origin.latitude, origin.longitude]);
      setZoom(12);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Failed to load nearby sites";
      setError(message);
      setSites([]);
    } finally {
      setLoading(false);
    }
  }, [search, category, governorate, radius, userLocation, pin]);

  useEffect(() => {
    if (!searchActive) return;
    const timer = setTimeout(reload, 300);
    return () => clearTimeout(timer);
  }, [search, reload]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (searchActive) return;
    const timer = setTimeout(() => reload(), 0);
    return () => clearTimeout(timer);
  }, [reload]); // eslint-disable-line react-hooks/exhaustive-deps

  const locate = useCallback(() => {
    setPin(null);
    setLocationStatus("locating");
    if (!("geolocation" in navigator)) {
      setLocationStatus("denied");
      setUserLocation(DEFAULT_LOCATION);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationStatus("granted");
        setUserLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      () => {
        setLocationStatus("denied");
        setUserLocation(DEFAULT_LOCATION);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setSearch("");
    setGovernorate("");
    setPin({ latitude: lat, longitude: lng });
  }, []);

  const clearPin = useCallback(() => setPin(null), []);

  const selectMonument = useCallback((monument: Monument) => {
    setSelectedMonument(monument);
    setSelectedSite(null);
    setRoute(null);
    setCenter([monument.latitude, monument.longitude]);
    setZoom(12);
    setTicketsEnabled(true);
  }, []);

  const monumentLookup = useMemo(
    () => (monuments ? buildMonumentLookup(monuments) : new Map<string, Monument>()),
    [monuments]
  );

  const ticketBySiteId = useMemo(() => {
    const map = new Map<string, Monument>();
    if (!monuments) return map;
    for (const site of sites) {
      const match = monumentLookup.get(normalizeName(site.name));
      if (match) map.set(site.id, match);
    }
    return map;
  }, [sites, monuments, monumentLookup]);

  useEffect(() => {
    const timer = setTimeout(locate, 0);
    return () => clearTimeout(timer);
  }, [locate]);

  const searchOrigin = useMemo(
    () => pin ?? userLocation,
    [pin, userLocation]
  );

  const selectSite = useCallback(
    async (site: Site) => {
      setSelectedSite(site);
      setCenter([site.latitude, site.longitude]);
      setZoom(13);
      if (!searchOrigin) return;
      setRouteLoading(true);
      setRoute(null);
      try {
        const r = await geoApi.getRoute(searchOrigin, {
          latitude: site.latitude,
          longitude: site.longitude,
        });
        setRoute(r);
      } catch {
        setRoute(null);
      } finally {
        setRouteLoading(false);
      }
    },
    [searchOrigin]
  );

  const distances = useMemo(() => {
    const map = new Map<string, number>();
    if (!searchOrigin) return map;
    for (const site of sites) {
      map.set(
        site.id,
        haversineKm(
          searchOrigin.latitude,
          searchOrigin.longitude,
          site.latitude,
          site.longitude
        )
      );
    }
    return map;
  }, [sites, searchOrigin]);

  const filteredMonuments = useMemo(() => {
    if (!monuments) return [];
    const term = search.trim().toLowerCase();
    return monuments.filter((monument) => {
      if (category && monument.category !== category) return false;
      if (!searchActive) {
        if (governorate && monument.governorate !== governorate) return false;
        if (
          searchOrigin &&
          haversineKm(
            searchOrigin.latitude,
            searchOrigin.longitude,
            monument.latitude,
            monument.longitude
          ) *
            1000 >
            radius
        ) {
          return false;
        }
      }
      if (
        term &&
        !monument.title.toLowerCase().includes(term) &&
        !(monument.city || "").toLowerCase().includes(term)
      ) {
        return false;
      }
      return true;
    });
  }, [monuments, search, searchActive, category, governorate, searchOrigin, radius]);

  const boundaryGeometry = useMemo<GeoJsonGeometry | null>(() => {
    if (!governorate) return null;
    return governorates.find((g) => g.name === governorate)?.geometry || null;
  }, [governorate, governorates]);

  const governorateNames = useMemo(
    () => governorates.map((g) => g.name),
    [governorates]
  );

  const selectedTripSites = useMemo(
    () => sites.filter((s) => tripSelection.has(s.id)),
    [sites, tripSelection]
  );

  const toggleTripSelect = useCallback((site: Site) => {
    setTripSelection((prev) => {
      const next = new Set(prev);
      if (next.has(site.id)) {
        next.delete(site.id);
      } else {
        if (next.size >= MAX_TRIP_STOPS) return prev;
        next.add(site.id);
      }
      return next;
    });
    setTripPlan(null);
  }, []);

  const planTrip = useCallback(async () => {
    if (!searchOrigin || selectedTripSites.length < 2) return;
    setTripLoading(true);
    setTripPlan(null);
    try {
      const plan = await geoApi.getTrip(searchOrigin, selectedTripSites);
      setTripPlan(plan);
    } catch {
      setTripPlan(null);
    } finally {
      setTripLoading(false);
    }
  }, [searchOrigin, selectedTripSites]);

  const clearTrip = useCallback(() => {
    setTripSelection(new Set());
    setTripPlan(null);
  }, []);

  const routeDistanceKm = route ? route.distanceMeters / 1000 : null;
  const routeMinutes = route ? Math.round(route.durationSeconds / 60) : null;
  const tripDistanceKm = tripPlan ? tripPlan.distanceMeters / 1000 : null;
  const tripMinutes = tripPlan ? Math.round(tripPlan.durationSeconds / 60) : null;
  const canPlan = !!searchOrigin && selectedTripSites.length >= 2;

  return (
    <AuthGuard>
      <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)]">
        {/* Sites list (larger column) */}
        <div className="flex flex-col flex-1 lg:w-[58%] lg:flex-none lg:flex-[0_0_58%] min-h-0 bg-white dark:bg-nile border-b lg:border-b-0 lg:border-r border-sand/50 dark:border-nile-light/20">
          <div className="p-4 border-b border-sand/50 dark:border-nile-light/20">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h1 className="text-lg font-serif font-bold text-nile dark:text-sand flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gold" />
                {t("title")}
              </h1>

              <button
                type="button"
                onClick={locate}
                disabled={locationStatus === "locating"}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors disabled:opacity-60"
              >
                {locationStatus === "locating" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <LocateFixed className="w-3.5 h-3.5" />
                )}
                {t("useMyLocation")}
              </button>
            </div>

            {!searchActive && !governorate && (pin || userLocation) && (
              <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
                {pin ? (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                    {t("pinnedPoint")} {pin.latitude.toFixed(4)},
                    {pin.longitude.toFixed(4)}
                    <button
                      type="button"
                      onClick={clearPin}
                      className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-sand/40 dark:bg-nile-light/20 text-muted-foreground hover:bg-sand/70 dark:hover:bg-nile-light/30 transition-colors"
                    >
                      <X className="w-3 h-3" />
                      {t("clearPin")}
                    </button>
                  </>
                ) : (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                    {t("youAreHere")} {userLocation!.latitude.toFixed(4)},
                    {userLocation!.longitude.toFixed(4)}
                    {locationStatus === "denied" && (
                      <span className="text-amber-600 dark:text-amber-400">
                        · {t("noLocation")}
                      </span>
                    )}
                  </>
                )}
              </div>
            )}

            {!governorate && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {t("radius")}
                </span>
                <div className="flex gap-1.5 flex-wrap">
                  {RADIUS_OPTIONS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRadius(r)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                        radius === r
                          ? "bg-gold text-white"
                          : "bg-sand/40 dark:bg-nile-light/20 text-muted-foreground hover:bg-sand/70 dark:hover:bg-nile-light/30"
                      }`}
                    >
                      {r >= 1000 ? `${r / 1000} km` : `${r} m`}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-b border-sand/50 dark:border-nile-light/20 space-y-3">
            <SearchBar
              value={search}
              onChange={setSearch}
              governorate={governorate}
              onGovernorateChange={setGovernorate}
              governorates={governorateNames}
              category={category}
              onCategoryChange={setCategory}
            />

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setTicketsEnabled((v) => !v);
                  setSelectedMonument(null);
                }}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                  ticketsEnabled
                    ? "bg-gold text-white"
                    : "bg-sand/40 dark:bg-nile-light/20 text-muted-foreground hover:bg-sand/70 dark:hover:bg-nile-light/30"
                }`}
              >
                <Ticket className="w-3.5 h-3.5" />
                {t("officialTickets")}
              </button>
              <button
                type="button"
                onClick={planTrip}
                disabled={!canPlan || tripLoading}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-gold text-white hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {tripLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RouteIcon className="w-3.5 h-3.5" />
                )}
                {t("planRoute")} ({selectedTripSites.length})
              </button>
              {selectedTripSites.length > 0 && (
                <button
                  type="button"
                  onClick={clearTrip}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-sand/40 dark:bg-nile-light/20 text-muted-foreground hover:bg-sand/70 dark:hover:bg-nile-light/30 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  {t("clearSelection")}
                </button>
              )}
              {!canPlan && selectedTripSites.length === 0 && (
                <span className="text-xs text-muted-foreground">
                  {t("selectStops")}
                </span>
              )}
            </div>
          </div>

          {route && (
            <div className="mx-4 mt-4 flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                <Navigation className="w-4 h-4" />
                <span className="font-medium">{t("directions")}</span>
                <span>
                  {routeDistanceKm!.toFixed(1)} km · {routeMinutes} min
                </span>
              </div>
              <button
                type="button"
                onClick={() => setRoute(null)}
                className="text-muted-foreground hover:text-nile dark:hover:text-sand transition-colors"
                aria-label="Clear route"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {tripPlan && (
            <div className="mx-4 mt-4 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
                  <RouteIcon className="w-4 h-4" />
                  <span className="font-medium">{t("optimizedRoute")}</span>
                  <span>
                    {tripDistanceKm!.toFixed(1)} km · {tripMinutes} min ·{" "}
                    {tripPlan.orderedStops.length} {t("stops")}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setTripPlan(null)}
                  className="text-muted-foreground hover:text-nile dark:hover:text-sand transition-colors"
                  aria-label="Clear trip route"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ol className="mt-2 space-y-1">
                {tripPlan.orderedStops.map((s, i) => (
                  <li
                    key={`${s.id}-${i}`}
                    className="text-xs text-muted-foreground flex items-start gap-2"
                  >
                    <span className="w-4 h-4 rounded-full bg-gold text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{s.name}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {loading || searching ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-gold" />
              </div>
            ) : error ? (
              <p className="text-sm text-red-500 p-4 text-center">{error}</p>
            ) : sites.length === 0 ? (
              <EmptyState
                icon="MapPin"
                title={t("noSites")}
                description={t("clickMap")}
              />
            ) : (
              sites.map((site) => (
                <SiteCard
                  key={site.id}
                  site={site}
                  distanceKm={distances.get(site.id)}
                  selected={selectedSite?.id === site.id}
                  onSelect={selectSite}
                  onNavigate={selectSite}
                  selectable
                  selectedForTrip={tripSelection.has(site.id)}
                  onToggleSelect={toggleTripSelect}
                  ticket={ticketBySiteId.get(site.id)}
                />
              ))
            )}

            {ticketsEnabled && monuments && filteredMonuments.length > 0 && (
              <div className="pt-4 mt-4 border-t border-sand/50 dark:border-nile-light/20">
                <h2 className="text-sm font-serif font-semibold text-nile dark:text-sand flex items-center gap-2 mb-3">
                  <Ticket className="w-4 h-4 text-gold" />
                  {t("portalMonuments")} ({filteredMonuments.length})
                </h2>
                <div className="space-y-3">
                  {filteredMonuments.map((monument) => (
                    <MonumentCard
                      key={monument.id}
                      monument={monument}
                      selected={selectedMonument?.id === monument.id}
                      onSelect={selectMonument}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Map (smaller column) */}
        <div className="relative z-0 h-72 lg:h-auto lg:flex-1 lg:min-w-0 bg-sand/20 dark:bg-nile-light/10">
          <MapView
            sites={sites}
            center={center}
            zoom={zoom}
            onSiteClick={selectSite}
            userLocation={userLocation}
            searchRadius={radius}
            route={route}
            selectedSite={selectedSite}
            boundary={boundaryGeometry}
            countryOutline={countryOutline}
            tripStops={tripPlan?.orderedStops}
            tripCoordinates={tripPlan?.coordinates}
            fitSites={searchActive}
            searchOrigin={searchOrigin}
            onMapClick={handleMapClick}
            ticketMonuments={filteredMonuments}
            selectedMonument={selectedMonument}
            onMonumentClick={selectMonument}
          />
          {(routeLoading || tripLoading) && (
            <div className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-nile shadow text-xs text-muted-foreground">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-gold" />
              {t("routeLoading")}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
