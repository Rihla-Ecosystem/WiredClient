import { coreClient, geoClient } from "./client";
import type { Site } from "@/lib/types";

export const HERITAGE_CATEGORIES = [
  "archaeological",
  "islamic",
  "christian",
] as const;

export const CATEGORY_LABELS: Record<string, string> = {
  archaeological: "explore.archaeological",
  islamic: "explore.islamic",
  christian: "explore.christian",
  infrastructure: "explore.infrastructure",
};

export interface SiteDetails {
  description?: string;
  images?: string[];
  rating?: number;
  visit_duration?: number;
  best_time?: string;
  tips?: string[];
}

export interface GeoPoi {
  id: string;
  name: string;
  name_en?: string | null;
  name_ar?: string | null;
  categories?: string[];
  details?: SiteDetails | null;
  governorate?: string | null;
  distance_meters?: number;
  lat: number;
  lon: number;
}

export interface SiteCreateData {
  osm_type?: string;
  osm_id?: number;
  name: string;
  name_en?: string;
  name_ar?: string;
  details?: SiteDetails;
  categories: string[];
  site_type?: string;
  lat: number;
  lon: number;
}

export interface GeoRoute {
  coordinates: [number, number][];
  distanceMeters: number;
  durationSeconds: number;
}

export type GeoJsonGeometry =
  | { type: "Polygon"; coordinates: number[][][] }
  | { type: "MultiPolygon"; coordinates: number[][][][] };

export interface Governorate {
  name: string;
  geometry: GeoJsonGeometry | null;
}

export interface TripPlan {
  coordinates: [number, number][];
  distanceMeters: number;
  durationSeconds: number;
  orderedStops: Site[];
}

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

function nearestNeighborOrder(
  start: { latitude: number; longitude: number },
  sites: Site[]
): Site[] {
  const remaining = [...sites];
  const ordered: Site[] = [];
  let cur = start;
  while (remaining.length > 0) {
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const d = haversineKm(
        cur.latitude,
        cur.longitude,
        remaining[i].latitude,
        remaining[i].longitude
      );
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    const next = remaining.splice(bestIdx, 1)[0];
    ordered.push(next);
    cur = next;
  }
  return ordered;
}

export function mapPoiToSite(poi: GeoPoi): Site {
  const details = poi.details || {};
  return {
    id: String(poi.id),
    name: poi.name_en || poi.name,
    nameAr: poi.name_ar || "",
    latitude: poi.lat,
    longitude: poi.lon,
    category: poi.categories?.[0] || "archaeological",
    governorate: poi.governorate || "",
    description: details.description || "",
    images: details.images || [],
    rating: details.rating ?? 4.5,
    visitDuration: details.visit_duration ?? 120,
    bestTime: details.best_time || "year-round",
    tips: details.tips || [],
  };
}

export interface GeoAdminSite {
  id: string;
  osm_type?: string | null;
  osm_id?: number | null;
  name: string;
  name_en?: string | null;
  name_ar?: string | null;
  details?: SiteDetails | null;
  categories?: string[] | null;
  site_type?: string | null;
  lat: number;
  lon: number;
}

export interface GeoAdminSiteInput {
  osm_type?: string;
  osm_id?: number;
  name: string;
  name_en?: string;
  name_ar?: string;
  details?: SiteDetails;
  categories?: string[];
  site_type?: string;
  lat: number;
  lon: number;
}

export const geoApi = {
  getGovernorates: async (): Promise<Governorate[]> => {
    const { data } = await coreClient.get<
      { name_en?: string | null; name?: string; geometry?: GeoJsonGeometry | null }[]
    >("/geo/governorates");
    return (data || [])
      .map((g) => ({
        name: g.name_en || g.name || "",
        geometry: g.geometry || null,
      }))
      .filter((g): g is Governorate => !!g.name)
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  getSitesByGovernorate: async (
    governorate: string,
    category?: string,
    limit?: number
  ): Promise<Site[]> => {
    const { data } = await coreClient.get<{ pois?: GeoPoi[] }>(
      "/geo/sites-by-governorate",
      { params: { governorate_name: governorate, category, limit } }
    );
    return (data.pois || []).map(mapPoiToSite);
  },

  getCountryBoundary: async (): Promise<GeoJsonGeometry | null> => {
    const { data } = await coreClient.get<
      { geometry?: GeoJsonGeometry | null }[]
    >("/geo/country");
    const boundary = (data || []).find((b) => b.geometry);
    return boundary?.geometry || null;
  },

  getNearbySites: async (
    lat: number,
    lng: number,
    radius?: number,
    categories?: string[]
  ): Promise<Site[]> => {
    const { data } = await coreClient.get<{ pois?: GeoPoi[] }>("/geo/pois", {
      params: {
        lat,
        lon: lng,
        radius,
        categories: categories?.join(",") || HERITAGE_CATEGORIES.join(","),
      },
    });
    return (data.pois || []).map(mapPoiToSite);
  },

  getRoute: async (
    from: { latitude: number; longitude: number },
    to: { latitude: number; longitude: number }
  ): Promise<{ coordinates: [number, number][]; distanceMeters: number; durationSeconds: number } | null> => {
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${from.longitude},${from.latitude};${to.longitude},${to.latitude}` +
      `?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const route = data?.routes?.[0];
    if (!route?.geometry?.coordinates) return null;
    return {
      coordinates: route.geometry.coordinates as [number, number][],
      distanceMeters: route.distance || 0,
      durationSeconds: route.duration || 0,
    };
  },

  getSite: async (id: string): Promise<Site> => {
    const { data } = await coreClient.get<GeoPoi>(`/geo/sites/${id}`);
    return mapPoiToSite(data);
  },

  search: async (
    q: string,
    opts?: { category?: string; governorate?: string; limit?: number }
  ): Promise<Site[]> => {
    const { data } = await coreClient.get<{ pois?: GeoPoi[] }>("/geo/search", {
      params: { q, category: opts?.category, governorate: opts?.governorate, limit: opts?.limit },
    });
    return (data.pois || []).map(mapPoiToSite);
  },

  getTrip: async (
    start: { latitude: number; longitude: number },
    sites: Site[]
  ): Promise<TripPlan | null> => {
    if (sites.length === 0) return null;
    const coords = [
      `${start.longitude},${start.latitude}`,
      ...sites.map((s) => `${s.longitude},${s.latitude}`),
    ].join(";");
    const url =
      `https://router.project-osrm.org/trip/v1/driving/${coords}` +
      `?roundtrip=false&source=first&overview=full&geometries=geojson`;
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json();
      const trip = data?.trips?.[0];
      const waypoints: { waypoint_index: number }[] = data?.waypoints || [];
      if (!trip?.geometry?.coordinates || waypoints.length === 0) return null;
      const order = [...waypoints]
        .sort((a, b) => a.waypoint_index - b.waypoint_index)
        .map((w) => w.waypoint_index);
      return {
        coordinates: trip.geometry.coordinates as [number, number][],
        distanceMeters: trip.distance || 0,
        durationSeconds: trip.duration || 0,
        orderedStops: order.slice(1).map((idx) => sites[idx - 1]),
      };
    } catch {
      const ordered = nearestNeighborOrder(start, sites);
      let distance = 0;
      const coords: [number, number][] = [
        [start.longitude, start.latitude],
        ...ordered.map((s) => [s.longitude, s.latitude] as [number, number]),
      ];
      let prev = start;
      for (const s of ordered) {
        distance +=
          haversineKm(prev.latitude, prev.longitude, s.latitude, s.longitude) *
          1000;
        prev = s;
      }
      return {
        coordinates: coords,
        distanceMeters: distance,
        durationSeconds: distance / 13.9,
        orderedStops: ordered,
      };
    }
  },

  createSite: (data: SiteCreateData) =>
    geoClient.post<{ site: unknown }>("/sites", data),

  updateSite: (id: string, data: Partial<SiteCreateData>) =>
    geoClient.patch<{ site: unknown }>(`/sites/${id}`, data),

  deleteSite: (id: string) => geoClient.delete(`/sites/${id}`),

  getAdminSites: async (): Promise<GeoAdminSite[]> => {
    const { data } = await geoClient.get<GeoAdminSite[]>("/sites");
    return data || [];
  },

  createAdminSite: (data: GeoAdminSiteInput) =>
    geoClient.post<GeoAdminSite>("/sites", data),

  updateAdminSite: (id: string, data: Partial<GeoAdminSiteInput>) =>
    geoClient.put<GeoAdminSite>(`/sites/${id}`, data),

  deleteAdminSite: (id: string) => geoClient.delete(`/sites/${id}`),
};
