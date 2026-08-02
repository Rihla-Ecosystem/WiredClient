"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { geoApi, type SiteCreateData } from "@/lib/api/geo";

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

export function useCreateSite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (siteData: SiteCreateData) => geoApi.createSite(siteData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["geo", "sites"] });
    },
  });
}

export function useUpdateSite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SiteCreateData> }) =>
      geoApi.updateSite(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["geo", "sites"] });
    },
  });
}

export function useDeleteSite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => geoApi.deleteSite(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["geo", "sites"] });
    },
  });
}
