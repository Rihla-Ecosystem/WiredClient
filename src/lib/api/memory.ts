import { coreClient } from "./client";

export interface TripRecord {
  id: string;
  title?: string | null;
  destination?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  notes?: string | null;
}

export interface InteractionSummary {
  id: string;
  summary: string;
  periodStart: string;
  periodEnd: string;
}

export interface Trip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  type: string;
  sites: number;
}

export function mapTripRecord(tr: TripRecord): Trip {
  return {
    id: tr.id,
    destination: tr.destination || tr.title || "Trip",
    startDate: tr.startDate
      ? new Date(tr.startDate).toLocaleDateString()
      : "",
    endDate: tr.endDate ? new Date(tr.endDate).toLocaleDateString() : "",
    type: tr.notes || "Journey",
    sites: 0,
  };
}

export const memoryApi = {
  getHistory: async (): Promise<Trip[]> => {
    const { data } = await coreClient.get<TripRecord[]>("/memory/history");
    return (Array.isArray(data) ? data : []).map(mapTripRecord);
  },

  getSummary: async (): Promise<InteractionSummary | null> => {
    const { data } = await coreClient.get<InteractionSummary | null>(
      "/memory/summary"
    );
    return data ?? null;
  },
};
