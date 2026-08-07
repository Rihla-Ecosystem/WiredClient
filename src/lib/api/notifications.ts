import { coreClient } from "./client";
import { useAuthStore } from "@/lib/stores/auth-store";

export type NotificationPriority = "LOW" | "NORMAL" | "HIGH" | "CRITICAL";
export type NotificationCategory =
  | "SAFETY"
  | "SECURITY"
  | "WEATHER"
  | "TRAFFIC"
  | "TOURIST"
  | "HISTORICAL"
  | "EMERGENCY"
  | "RESTRICTED_AREA"
  | "PHOTOGRAPHY"
  | "RECOMMENDATION"
  | "SYSTEM";
export type NotificationSource =
  | "SYSTEM"
  | "AI"
  | "ADMIN"
  | "CONTEXT"
  | "EMERGENCY";

export interface InboxNotification {
  id: string;
  type: string;
  category: NotificationCategory | string;
  priority: NotificationPriority | string;
  source: NotificationSource | string;
  title: string;
  message: string;
  data?: {
    area?: string | null;
    riskLevel?: string | null;
    contextReportArea?: string | null;
    [key: string]: unknown;
  } | null;
  lat?: number | null;
  lng?: number | null;
  isRead: boolean;
  readAt?: string | null;
  deliveredAt: string;
  createdAt: string;
}

export interface NotificationPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface InboxResponse {
  success: boolean;
  data: {
    notifications: InboxNotification[];
    pagination: NotificationPagination;
  };
}

/** A location-lead context analysis result. */
export interface LocationEngineResult {
  success: boolean;
  data: LocationUpdateData;
}

export interface LocationUpdateData {
  notifications: GeneratedNotification[];
  contextReport: ContextReport;
}

export interface UnreadResponse {
  success: boolean;
  data: { unread: number };
}

/** Fields shared by all notifications regardless of category type. */
export interface GeneratedNotification {
  id?: string;
  title: string;
  message: string;
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR" | "SYSTEM";
  category: string;
  priority: NotificationPriority | string;
  source: NotificationSource | string;
  cooldownKey: string;
  lat?: number;
  lng?: number;
  data?: Record<string, unknown>;
}

export interface AreaInfo {
  area: string | null;
  atSite: string | null;
  governorate: string | null;
  zone: string | null;
  nearbyAttractionsCount: number;
  nearbyServicesCount: number;
  restrictedAreas: string[];
  photographyRestrictions: string[];
}

export interface AiSummary {
  executiveSummary: string;
  currentSituation: string;
  safetyAssessment: string;
  riskAnalysis: string;
  personalizedRecommendations: string[];
  touristTips: string[];
  historicalSummary: string;
  interestingFacts: string[];
  thingsToAvoid: string[];
  recommendedActions: string[];
  emergencyInstructions: string[];
}

export interface NearbyPlace {
  name: string;
  nameEn?: string | null;
  distanceMeters?: number;
  category?: string;
  kind?: string;
}

export interface EmergencyContact {
  type: string;
  name: string;
  phone: string;
}

export interface ContextReport {
  id?: string;
  areaInformation: AreaInfo;
  aiSummary: AiSummary;
  safetyScore: number;
  riskLevel: string;
  historicalInformation: string;
  touristTips: string[];
  recommendations: string[];
  thingsToAvoid: string[];
  nearbyAttractions: NearbyPlace[];
  nearbyRestaurants: NearbyPlace[];
  nearbyHotels: NearbyPlace[];
  nearbyHospitals: NearbyPlace[];
  nearbyPoliceStations: NearbyPlace[];
  nearbyTransportation: NearbyPlace[];
  emergencyContacts: EmergencyContact[];
  generatedAt: string;
}

export interface StoredContextReport {
  id: string;
  userId: string;
  lat?: number | null;
  lng?: number | null;
  areaName?: string | null;
  context?: unknown;
  report?: ContextReport | null;
  notifications?: Array<{
    id: string;
    title: string;
    priority: string;
  }> | null;
  summary?: string | null;
  createdAt: string;
}

export interface ReportsResponse {
  success: boolean;
  data: {
    reports: StoredContextReport[];
    pagination: NotificationPagination;
  };
}

export interface NotificationPreferences {
  enabled: boolean;
  categories: Record<string, boolean>;
  quietHours: { enabled: boolean; from: string; to: string };
}

const CORE_API_URL =
  process.env.NEXT_PUBLIC_CORE_API_URL || "http://localhost:3000/api";

export const notificationsApi = {
  /** Report the user's current location; the engine may generate alerts. */
  reportLocation: (payload: {
    lat: number;
    lng: number;
    accuracy?: number;
    altitude?: number;
    speed?: number;
    heading?: number;
    timestamp?: number;
    reason?: "movement" | "geofence_enter" | "geofence_exit" | "initial" | "manual";
    geofenceEvents?: Array<{
      fenceId?: string;
      name?: string;
      type: "enter" | "exit";
      polygon?: Array<{ lat: number; lng: number }>;
    }>;
  }) =>
    coreClient.post<LocationEngineResult>(`/context-notifications/location`, payload),

  getInbox: (params?: { page?: number; limit?: number; isRead?: boolean }) =>
    coreClient.get<InboxResponse>(`/context-notifications/inbox`, { params }),

  getUnreadCount: () =>
    coreClient.get<UnreadResponse>(`/context-notifications/unread-count`),

  markRead: (id: string) =>
    coreClient.patch<{ success: boolean; data: InboxNotification }>(
      `/context-notifications/inbox/${id}/read`
    ),

  markAllRead: () =>
    coreClient.patch<{ success: boolean; data: { updated: number } }>(
      `/context-notifications/inbox/read-all`
    ),

  deleteInbox: (id: string) =>
    coreClient.delete<{ success: boolean; data: { id: string; deleted: boolean } }>(
      `/context-notifications/inbox/${id}`
    ),

  sync: (lastSync?: string) =>
    coreClient.post<{
      success: boolean;
      data: {
        notifications: InboxNotification[];
        totalUnread: number;
      };
    }>(`/context-notifications/sync`, lastSync ? { lastSync } : {}),

  getReports: (params?: { page?: number; limit?: number }) =>
    coreClient.get<ReportsResponse>(`/context-notifications/reports`, { params }),

  getReport: (id: string) =>
    coreClient.get<{ success: boolean; data: StoredContextReport }>(
      `/context-notifications/reports/${id}`
    ),

  getPreferences: () =>
    coreClient.get<{ success: boolean; data: NotificationPreferences }>(
      `/context-notifications/preferences`
    ),

  updatePreferences: (patch: Partial<NotificationPreferences>) =>
    coreClient.put<{ success: boolean; data: NotificationPreferences }>(
      `/context-notifications/preferences`,
      patch
    ),

  /** Subscribe to the realtime notification stream via fetch-based SSE. */
  streamNotifications: () => {
    const token = useAuthStore.getState().accessToken;
    const controller = new AbortController();

    const stream = (async function* () {
      const response = await fetch(`${CORE_API_URL}/context-notifications/stream`, {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`Stream failed: ${response.status}`);
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const raw = line.slice(6).trim();
            if (!raw || raw === "[DONE]") continue;
            try {
              yield JSON.parse(raw) as Record<string, unknown>;
            } catch {
              // ignore malformed frames
            }
          }
        }
      }
    })();

    return { stream, abort: () => controller.abort() };
  },
};