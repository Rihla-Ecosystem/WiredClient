"use client";

import { useQuery } from "@tanstack/react-query";
import { geoApi } from "@/lib/api/geo";

export function useGovernorates() {
  return useQuery({
    queryKey: ["geo", "governorates"],
    queryFn: geoApi.getGovernorates,
  });
}

export function useSitesByGovernorate(governorate: string) {
  return useQuery({
    queryKey: ["geo", "sites", governorate],
    queryFn: () => geoApi.getSitesByGovernorate(governorate),
    enabled: !!governorate,
  });
}

export function useSite(id: string) {
  return useQuery({
    queryKey: ["geo", "site", id],
    queryFn: () => geoApi.getSite(id),
    enabled: !!id,
  });
}

export function useNearbySites(lat: number, lng: number, radius?: number) {
  return useQuery({
    queryKey: ["geo", "nearby", lat, lng, radius],
    queryFn: () => geoApi.getNearbySites(lat, lng, radius),
    enabled: !!lat && !!lng,
  });
}
