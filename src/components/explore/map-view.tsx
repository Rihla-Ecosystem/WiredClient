"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type * as L from "leaflet";

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr: false }
);
const Polyline = dynamic(
  () => import("react-leaflet").then((m) => m.Polyline),
  { ssr: false }
);
const Circle = dynamic(
  () => import("react-leaflet").then((m) => m.Circle),
  { ssr: false }
);
const Tooltip = dynamic(
  () => import("react-leaflet").then((m) => m.Tooltip),
  { ssr: false }
);
const GeoJSON = dynamic(
  () => import("react-leaflet").then((m) => m.GeoJSON),
  { ssr: false }
);

const FitBounds = dynamic(
  () => import("./fit-bounds").then((m) => m.FitBounds),
  { ssr: false }
);

const MapClickCatcher = dynamic(
  () => import("./map-click-catcher").then((m) => m.MapClickCatcher),
  { ssr: false }
);

import type { Site } from "@/lib/types";
import type { GeoJsonGeometry, GeoRoute } from "@/lib/api/geo";
import type { Monument } from "@/lib/api/egymonuments";

interface MapViewProps {
  sites: Site[];
  center: [number, number];
  zoom?: number;
  onSiteClick?: (site: Site) => void;
  userLocation?: { latitude: number; longitude: number } | null;
  searchRadius?: number;
  route?: GeoRoute | null;
  selectedSite?: Site | null;
  boundary?: GeoJsonGeometry | null;
  countryOutline?: GeoJsonGeometry | null;
  tripStops?: Site[];
  tripCoordinates?: [number, number][];
  fitSites?: boolean;
  searchOrigin?: { latitude: number; longitude: number } | null;
  onMapClick?: (lat: number, lng: number) => void;
  ticketMonuments?: Monument[];
  selectedMonument?: Monument | null;
  onMonumentClick?: (monument: Monument) => void;
}

const EGYPT_BOUNDS: [[number, number], [number, number]] = [
  [22.0, 25.0],
  [31.5, 37.0],
];

const DEFAULT_CENTER: [number, number] = [26.8206, 30.8025];

export const CATEGORY_STYLE: Record<
  string,
  { color: string; emoji: string }
> = {
  archaeological: { color: "#d97706", emoji: "🏛️" },
  islamic: { color: "#059669", emoji: "🕌" },
  christian: { color: "#2563eb", emoji: "⛪" },
  infrastructure: { color: "#7c3aed", emoji: "🏗️" },
};

const DEFAULT_CATEGORY_STYLE = { color: "#a16207", emoji: "📍" };

function buildSiteIcon(
  L: typeof import("leaflet"),
  color: string,
  emoji: string,
  selected: boolean
): L.DivIcon {
  const size = selected ? 40 : 32;
  return L.divIcon({
    className: "",
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;width:${size}px;">
        <div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;font-size:${selected ? 18 : 15}px;">
          <span style="line-height:1;">${emoji}</span>
        </div>
        <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid ${color};"></div>
      </div>`,
    iconSize: [size, size + 8],
    iconAnchor: [size / 2, size + 8],
    popupAnchor: [0, -(size + 6)],
  });
}

function buildUserIcon(L: typeof import("leaflet")): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `
      <div style="position:relative;width:30px;height:30px;">
        <div style="position:absolute;inset:0;border-radius:50%;background:rgba(59,130,246,.25);border:2px solid rgba(59,130,246,.5);"></div>
        <div style="position:absolute;inset:9px;border-radius:50%;background:#2563eb;border:2px solid #fff;"></div>
      </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

function buildNumberIcon(
  L: typeof import("leaflet"),
  n: number
): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `
      <div style="width:26px;height:26px;border-radius:50%;background:#d97706;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:13px;">${n}</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -14],
  });
}

function buildPinIcon(L: typeof import("leaflet")): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `
      <div style="width:32px;height:32px;border-radius:50%;background:#dc2626;border:3px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"><circle cx="12" cy="12" r="7"/></svg>
      </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
}

function buildTicketIcon(
  L: typeof import("leaflet"),
  color: string,
  selected: boolean
): L.DivIcon {
  const size = selected ? 38 : 30;
  return L.divIcon({
    className: "",
    html: `
      <div style="width:${size}px;height:${Math.round(size * 1.15)}px;border-radius:6px;background:${color};border:2px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;font-size:${selected ? 18 : 14}px;line-height:1;">
        <span>🎫</span>
      </div>`,
    iconSize: [size, Math.round(size * 1.15)],
    iconAnchor: [size / 2, Math.round(size * 1.15) / 2],
    popupAnchor: [0, -Math.round(size * 1.15) / 2],
  });
}

function MapContent({
  sites,
  onSiteClick,
  userLocation,
  searchRadius,
  route,
  selectedSite,
  boundary,
  countryOutline,
  tripStops,
  tripCoordinates,
  fitSites,
  searchOrigin,
  onMapClick,
  ticketMonuments,
  selectedMonument,
  onMonumentClick,
}: {
  sites: Site[];
  onSiteClick?: (site: Site) => void;
  userLocation?: { latitude: number; longitude: number } | null;
  searchRadius?: number;
  route?: GeoRoute | null;
  selectedSite?: Site | null;
  boundary?: GeoJsonGeometry | null;
  countryOutline?: GeoJsonGeometry | null;
  tripStops?: Site[];
  tripCoordinates?: [number, number][];
  fitSites?: boolean;
  searchOrigin?: { latitude: number; longitude: number } | null;
  onMapClick?: (lat: number, lng: number) => void;
  ticketMonuments?: Monument[];
  selectedMonument?: Monument | null;
  onMonumentClick?: (monument: Monument) => void;
}) {
  const [icons, setIcons] = useState<{
    site: Record<string, L.DivIcon>;
    user: L.DivIcon | null;
    buildSelected: (color: string, emoji: string) => L.DivIcon;
    number: (n: number) => L.DivIcon;
    pin: L.DivIcon | null;
    ticket: (color: string, selected: boolean) => L.DivIcon;
  } | null>(null);

  useEffect(() => {
    import("leaflet/dist/leaflet.css");
    import("leaflet").then((L) => {
      const proto = L.Icon.Default.prototype as L.Icon.Default & {
        _getIconUrl?: unknown;
      };
      delete proto._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
      const siteIcons: Record<string, L.DivIcon> = {};
      for (const [cat, style] of Object.entries(CATEGORY_STYLE)) {
        siteIcons[cat] = buildSiteIcon(L, style.color, style.emoji, false);
      }
      siteIcons.__default = buildSiteIcon(
        L,
        DEFAULT_CATEGORY_STYLE.color,
        DEFAULT_CATEGORY_STYLE.emoji,
        false
      );
      setIcons({
        site: siteIcons,
        user: buildUserIcon(L),
        buildSelected: (color, emoji) => buildSiteIcon(L, color, emoji, true),
        number: (n) => buildNumberIcon(L, n),
        pin: buildPinIcon(L),
        ticket: (color, selected) => buildTicketIcon(L, color, selected),
      });
    });
  }, []);

  const routeLatLngs = useMemo(
    () =>
      route?.coordinates.map(([lng, lat]) => [lat, lng] as [number, number]) ||
      [],
    [route]
  );

  const tripLatLngs = useMemo(
    () =>
      tripCoordinates?.map(([lng, lat]) => [lat, lng] as [number, number]) ||
      [],
    [tripCoordinates]
  );

  const boundaryPoints = useMemo<[number, number][]>(() => {
    if (!boundary) return [];
    if (boundary.type === "Polygon") {
      return boundary.coordinates
        .flatMap((ring) => ring)
        .map(([lng, lat]) => [lat, lng] as [number, number]);
    }
    if (boundary.type === "MultiPolygon") {
      return boundary.coordinates
        .flatMap((poly) => poly)
        .flatMap((ring) => ring)
        .map(([lng, lat]) => [lat, lng] as [number, number]);
    }
    return [];
  }, [boundary]);

  const siteFitPoints = useMemo<[number, number][]>(
    () =>
      fitSites
        ? sites.map((s) => [s.latitude, s.longitude] as [number, number])
        : [],
    [fitSites, sites]
  );

  if (!icons) return null;

  const iconFor = (site: Site): L.DivIcon => {
    const base = icons.site[site.category] || icons.site.__default;
    const selected = selectedSite?.id === site.id;
    if (!selected) return base;
    const style = CATEGORY_STYLE[site.category] || DEFAULT_CATEGORY_STYLE;
    return icons.buildSelected(style.color, style.emoji);
  };

  return (
    <>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {countryOutline && (
        <GeoJSON
          data={countryOutline}
          style={{
            color: "#94a3b8",
            weight: 1.5,
            dashArray: "4 4",
            fill: false,
            interactive: false,
          }}
        />
      )}

      {onMapClick && <MapClickCatcher onMapClick={onMapClick} />}

      {(userLocation || searchOrigin) && (
        <>
          <Circle
            center={
              searchOrigin
                ? [searchOrigin.latitude, searchOrigin.longitude]
                : [userLocation!.latitude, userLocation!.longitude]
            }
            radius={searchRadius || 5000}
            pathOptions={{
              color: "#2563eb",
              weight: 1.5,
              dashArray: "6 6",
              fillColor: "#2563eb",
              fillOpacity: 0.06,
            }}
          />
          {userLocation && (
            <Marker
              position={[userLocation.latitude, userLocation.longitude]}
              icon={icons.user!}
              zIndexOffset={1000}
            >
              <Popup>You are here</Popup>
            </Marker>
          )}
        </>
      )}

      {searchOrigin && icons.pin && (
        <Marker
          position={[searchOrigin.latitude, searchOrigin.longitude]}
          icon={icons.pin}
          zIndexOffset={1050}
        >
          <Popup>Search point</Popup>
        </Marker>
      )}

      {boundary && (
        <GeoJSON
          data={boundary}
          style={{
            color: "#d97706",
            weight: 2,
            fillColor: "#d97706",
            fillOpacity: 0.06,
          }}
        />
      )}

      {routeLatLngs.length > 1 && (
        <Polyline
          positions={routeLatLngs}
          pathOptions={{ color: "#2563eb", weight: 4, opacity: 0.85 }}
        />
      )}

      {tripLatLngs.length > 1 && (
        <Polyline
          positions={tripLatLngs}
          pathOptions={{
            color: "#d97706",
            weight: 5,
            opacity: 0.9,
            dashArray: "8 8",
          }}
        />
      )}

      {sites.map((site) => (
        <Marker
          key={site.id}
          position={[site.latitude, site.longitude]}
          icon={iconFor(site)}
          eventHandlers={{
            click: () => onSiteClick?.(site),
          }}
        >
          <Tooltip direction="top" offset={[0, -8]}>
            <div className="text-xs font-medium">{site.name}</div>
          </Tooltip>
          <Popup>
            <div className="text-sm">
              <strong>{site.name}</strong>
              {site.nameAr && (
                <p className="text-xs text-muted-foreground font-arabic" dir="rtl">
                  {site.nameAr}
                </p>
              )}
              {site.governorate && (
                <p className="text-xs text-muted-foreground">
                  {site.governorate}
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}

      {tripStops?.map((site, i) => (
        <Marker
          key={`trip-${site.id}`}
          position={[site.latitude, site.longitude]}
          icon={icons.number(i + 1)}
          zIndexOffset={600 + i}
          eventHandlers={{
            click: () => onSiteClick?.(site),
          }}
        >
          <Tooltip direction="top" offset={[0, -10]}>
            <div className="text-xs font-medium">
              {i + 1}. {site.name}
            </div>
          </Tooltip>
        </Marker>
      ))}

      {ticketMonuments?.map((monument) => {
        const style = CATEGORY_STYLE[monument.category] || DEFAULT_CATEGORY_STYLE;
        const price = (v: number | null | undefined) =>
          v == null ? "N/A" : `LE ${v}`;
        return (
          <Marker
            key={`egym-${monument.id}`}
            position={[monument.latitude, monument.longitude]}
            icon={icons.ticket(style.color, selectedMonument?.id === monument.id)}
            zIndexOffset={selectedMonument?.id === monument.id ? 800 : 500}
            eventHandlers={{
              click: () => onMonumentClick?.(monument),
            }}
          >
            <Tooltip direction="top" offset={[0, -14]}>
              <div className="text-xs font-medium">{monument.title}</div>
            </Tooltip>
            <Popup>
              <div className="text-sm">
                <strong>{monument.title}</strong>
                {(monument.city || monument.governorate) && (
                  <p className="text-xs text-muted-foreground">
                    {[monument.city, monument.governorate].filter(Boolean).join(" · ")}
                  </p>
                )}
                <p className="text-xs mt-1">
                  <span className="font-medium">Egyptian:</span> {price(monument.prices.egyptian?.adult)} / {price(monument.prices.egyptian?.student)}
                </p>
                <p className="text-xs">
                  <span className="font-medium">Foreigner:</span> {price(monument.prices.foreigner?.adult)} / {price(monument.prices.foreigner?.student)}
                </p>
                <a
                  href={monument.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-medium text-gold hover:underline mt-1 inline-block"
                >
                  Buy tickets
                </a>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {tripLatLngs.length > 1 ? (
        <FitBounds points={tripLatLngs} />
      ) : routeLatLngs.length > 1 ? (
        <FitBounds points={routeLatLngs} />
      ) : boundaryPoints.length > 2 ? (
        <FitBounds points={boundaryPoints} />
      ) : siteFitPoints.length > 1 ? (
        <FitBounds points={siteFitPoints} />
      ) : null}
    </>
  );
}

export function MapView({
  sites,
  center,
  zoom = 7,
  onSiteClick,
  userLocation,
  searchRadius,
  route,
  selectedSite,
  boundary,
  countryOutline,
  tripStops,
  tripCoordinates,
  fitSites,
  searchOrigin,
  onMapClick,
  ticketMonuments,
  selectedMonument,
  onMonumentClick,
}: MapViewProps) {
  const mapCenter = useMemo(
    () => (center ? center : DEFAULT_CENTER),
    [center]
  );

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-sand/50 dark:border-nile-light/20 z-0">
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        className="w-full h-full"
        maxBounds={EGYPT_BOUNDS}
        maxBoundsViscosity={1.0}
        scrollWheelZoom={true}
      >
        <MapContent
          sites={sites}
          onSiteClick={onSiteClick}
          userLocation={userLocation}
          searchRadius={searchRadius}
          route={route}
          selectedSite={selectedSite}
          boundary={boundary}
          countryOutline={countryOutline}
          tripStops={tripStops}
          tripCoordinates={tripCoordinates}
          fitSites={fitSites}
          searchOrigin={searchOrigin}
          onMapClick={onMapClick}
          ticketMonuments={ticketMonuments}
          selectedMonument={selectedMonument}
          onMonumentClick={onMonumentClick}
        />
      </MapContainer>
    </div>
  );
}
