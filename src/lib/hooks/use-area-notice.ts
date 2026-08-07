"use client";

import { useQuery } from "@tanstack/react-query";
import { geoApi, type AreaNotice } from "@/lib/api/geo";

export const AREA_NOTICE_POLL_MS = 15000;

export function useAreaNotice(lat?: number, lng?: number, radius?: number) {
  return useQuery<AreaNotice | null>({
    queryKey: ["area-notice", lat, lng, radius],
    queryFn: () =>
      lat !== undefined && lng !== undefined
        ? geoApi.getAreaNotice(lat, lng, radius)
        : Promise.resolve(null),
    enabled: lat !== undefined && lng !== undefined,
    refetchInterval: AREA_NOTICE_POLL_MS,
  });
}