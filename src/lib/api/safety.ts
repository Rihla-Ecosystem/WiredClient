import { coreClient } from "./client";

export interface SafetyEvent {
  id: string;
  type: "advisory" | "warning" | "critical" | "info";
  title: string;
  description: string;
  source: string;
  timestamp: string;
  location?: string;
}

export interface StaticNote {
  source?: string;
  category?: string;
  severity?: string;
  city?: string;
  headline?: string;
  effectiveTime?: string;
  rawRef?: string;
}

export interface CityRisk {
  city: string;
  level: "low" | "moderate" | "high" | "critical";
  score: number;
  updatedAt?: string | null;
  staticNote?: StaticNote | string | null;
  events: SafetyEvent[];
}

export interface SourceHealthEntry {
  name: string;
  status: "healthy" | "degraded" | "down";
  lastUpdate: string;
  category: string;
}

export const safetyApi = {
  getRiskSummary: (city?: string) =>
    coreClient.get<CityRisk>(`/safety/city/${encodeURIComponent(city || "Cairo")}`),

  getEvents: () => coreClient.get<{ events: SafetyEvent[] }>("/safety/events"),

  getSourceHealth: () =>
    coreClient.get<{ sources: SourceHealthEntry[] }>("/safety/sources"),

  getCityRisk: (city: string) =>
    coreClient.get<CityRisk>(`/safety/city/${encodeURIComponent(city)}`),
};
