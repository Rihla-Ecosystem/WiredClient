"use client";

import { useQuery } from "@tanstack/react-query";
import { safetyApi } from "@/lib/api/safety";

export function useRiskSummary(city?: string) {
  return useQuery({
    queryKey: ["safety", "summary", city],
    queryFn: () => safetyApi.getRiskSummary(city),
    refetchInterval: 15000,
  });
}

export function useRiskEvents() {
  return useQuery({
    queryKey: ["safety", "events"],
    queryFn: async () => {
      const { data } = await safetyApi.getEvents();
      return data.events;
    },
    refetchInterval: 15000,
  });
}

export function useSourceHealth() {
  return useQuery({
    queryKey: ["safety", "sources"],
    queryFn: async () => {
      const { data } = await safetyApi.getSourceHealth();
      return data.sources;
    },
    refetchInterval: 30000,
  });
}
