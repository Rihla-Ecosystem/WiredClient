"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type * as L from "leaflet";

import type { Monument } from "@/lib/api/egymonuments";
import type { GeoRoute } from "@/lib/api/geo";

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
const MapClickCatcher = dynamic(
  () => import("../explore/map-click-catcher").then((m) => m.MapClickCatcher),
  { ssr: false }
);
const FitBounds = dynamic(
  () => import("../explore/fit-bounds").then((m) => m.FitBounds),
  { ssr: false }
);

interface TicketMapProps {
  monument: Monument;
  start?: { latitude: number; longitude: number } | null;
  route?: GeoRoute | null;
  onMapClick?: (lat: number, lng: number) => void;
}

function buildStartIcon(L: typeof import("leaflet")): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `
      <div style="position:relative;width:26px;height:26px;">
        <div style="position:absolute;inset:0;border-radius:50%;background:rgba(5,150,105,.25);border:2px solid rgba(5,150,105,.5);"></div>
        <div style="position:absolute;inset:7px;border-radius:50%;background:#059669;border:2px solid #fff;"></div>
      </div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -14],
  });
}

function buildMonumentIcon(L: typeof import("leaflet")): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `
      <div style="width:34px;height:40px;filter:drop-shadow(0 2px 6px rgba(0,0,0,.35));">
        <svg width="34" height="40" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C7.6 2 4 5.6 4 10c0 5.2 8 12 8 12s8-6.8 8-12c0-4.4-3.6-8-8-8z" fill="#d97706" stroke="#fff" stroke-width="1.4"/>
          <text x="12" y="16" font-size="11" text-anchor="middle" fill="#fff" font-family="sans-serif">🎫</text>
        </svg>
      </div>`,
    iconSize: [34, 40],
    iconAnchor: [17, 40],
    popupAnchor: [0, -38],
  });
}

export function TicketMap({ monument, start, route, onMapClick }: TicketMapProps) {
  const [icons, setIcons] = useState<{
    start: L.DivIcon;
    monument: L.DivIcon;
  } | null>(null);

  useEffect(() => {
    import("leaflet").then((L) => {
      setIcons({
        start: buildStartIcon(L),
        monument: buildMonumentIcon(L),
      });
    });
  }, []);

  const routeLatLngs = useMemo(
    () =>
      route?.coordinates.map(([lng, lat]) => [lat, lng] as [number, number]) ||
      [],
    [route]
  );

  const fitPoints = useMemo<[number, number][]>(() => {
    const points: [number, number][] = [];
    if (start) points.push([start.latitude, start.longitude]);
    points.push([monument.latitude, monument.longitude]);
    if (routeLatLngs.length > 1) points.push(...routeLatLngs);
    return points;
  }, [start, monument, routeLatLngs]);

  if (!icons) {
    return (
      <div className="w-full h-64 rounded-xl bg-sand/20 dark:bg-nile-light/10 animate-pulse" />
    );
  }

  const center: [number, number] = start
    ? [start.latitude, start.longitude]
    : [monument.latitude, monument.longitude];

  return (
    <div className="w-full h-64 rounded-xl overflow-hidden border border-sand/50 dark:border-nile-light/20 z-0">
      <MapContainer center={center} zoom={13} className="w-full h-full" scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {onMapClick && <MapClickCatcher onMapClick={onMapClick} />}
        {start && (
          <Marker
            position={[start.latitude, start.longitude]}
            icon={icons.start}
            zIndexOffset={1000}
          >
            <Popup>Start</Popup>
          </Marker>
        )}
        <Marker
          position={[monument.latitude, monument.longitude]}
          icon={icons.monument}
          zIndexOffset={900}
        >
          <Popup>{monument.title}</Popup>
        </Marker>
        {routeLatLngs.length > 1 && (
          <Polyline
            positions={routeLatLngs}
            pathOptions={{ color: "#d97706", weight: 4, opacity: 0.85 }}
          />
        )}
        {fitPoints.length > 1 ? <FitBounds points={fitPoints} /> : null}
      </MapContainer>
    </div>
  );
}
