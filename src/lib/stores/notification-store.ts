import { create } from "zustand";
import {
  notificationsApi,
  type InboxNotification,
  type GeneratedNotification,
  type ContextReport,
  type StoredContextReport,
  type NotificationPreferences,
} from "@/lib/api/notifications";
import { useAuthStore } from "@/lib/stores/auth-store";

interface NotificationState {
  unreadCount: number;
  inbox: InboxNotification[];
  recentTotal: number;
  reports: StoredContextReport[];
  activeReport: ContextReport | null;
  activeNotifications: GeneratedNotification[];
  preferences: NotificationPreferences | null;
  isConnected: boolean;
  loading: boolean;
  error: string | null;

  refreshUnread: () => Promise<void>;
  loadInbox: (params?: { page?: number; limit?: number; isRead?: boolean }) => Promise<void>;
  loadReports: (params?: { page?: number; limit?: number }) => Promise<void>;
  loadPreferences: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  deleteInbox: (id: string) => Promise<void>;
  updatePreferences: (patch: Partial<NotificationPreferences>) => Promise<void>;
  /** Report location → engine may emit notifications + context report. */
  reportLocation: (
    payload: {
      lat: number;
      lng: number;
      reason?: "movement" | "geofence_enter" | "geofence_exit" | "initial" | "manual";
    }
  ) => Promise<{
    notifications: GeneratedNotification[];
    contextReport: ContextReport | null;
  } | null>;
  applyLive: (notification: InboxNotification) => void;
  reset: () => void;
}

/** Shape of an engine-generated notification before it's an inbox row. */
type NewsNotification = {
  id?: string;
  title: string;
  message: string;
  type: GeneratedNotification["type"];
  category: GeneratedNotification["category"];
  priority: GeneratedNotification["priority"];
  source: GeneratedNotification["source"];
  cooldownKey: string;
  lat?: number;
  lng?: number;
  data?: Record<string, unknown>;
};

function toInboxNotification(n: NewsNotification & { id: string }): InboxNotification {
  return {
    id: n.id,
    type: n.type,
    category: n.category,
    priority: n.priority,
    source: n.source,
    title: n.title,
    message: n.message,
    data: (n.data ?? null) as InboxNotification["data"],
    lat: n.lat ?? null,
    lng: n.lng ?? null,
    isRead: false,
    readAt: null,
    deliveredAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
}

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  unreadCount: 0,
  inbox: [],
  recentTotal: 0,
  reports: [],
  activeReport: null,
  activeNotifications: [],
  preferences: null,
  isConnected: false,
  loading: false,
  error: null,

  refreshUnread: async () => {
    const { accessToken } = useAuthStore.getState();
    if (!accessToken) return;
    try {
      const res = await notificationsApi.getUnreadCount();
      if (res.data?.data) set({ unreadCount: res.data.data.unread });
    } catch {
      // ignore transient failures
    }
  },

  loadInbox: async (params) => {
    set({ loading: true, error: null });
    try {
      const res = await notificationsApi.getInbox(params);
      const data = res.data.data;
      set({
        inbox: data.notifications,
        recentTotal: data.pagination.total,
        loading: false,
      });
    } catch (e) {
      set({
        loading: false,
        error: e instanceof Error ? e.message : "Failed to load inbox",
      });
    }
  },

  loadReports: async (params) => {
    set({ loading: true, error: null });
    try {
      const res = await notificationsApi.getReports(params);
      set({ reports: res.data.data.reports, loading: false });
    } catch (e) {
      set({
        loading: false,
        error: e instanceof Error ? e.message : "Failed to load reports",
      });
    }
  },

  loadPreferences: async () => {
    try {
      const res = await notificationsApi.getPreferences();
      set({ preferences: res.data.data ?? null });
    } catch {
      // non-fatal
    }
  },

  markRead: async (id) => {
    try {
      await notificationsApi.markRead(id);
      get().refreshUnread();
      set((s) => ({
        inbox: s.inbox.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      }));
    } catch {
      // ignore
    }
  },

  markAllRead: async () => {
    try {
      await notificationsApi.markAllRead();
      set((s) => ({
        inbox: s.inbox.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch {
      // ignore
    }
  },

  deleteInbox: async (id) => {
    try {
      await notificationsApi.deleteInbox(id);
      get().refreshUnread();
      set((s) => ({ inbox: s.inbox.filter((n) => n.id !== id) }));
    } catch {
      // ignore
    }
  },

  updatePreferences: async (patch) => {
    const res = await notificationsApi.updatePreferences(patch);
    set({ preferences: res.data.data ?? null });
  },

  reportLocation: async (payload) => {
    const { accessToken } = useAuthStore.getState();
    if (!accessToken) return null;
    try {
      const res = await notificationsApi.reportLocation(payload);
      const data = res.data?.data;
      if (!data) return null;
      // The engine returns the notifications it just generated; the same ones
      // also arrive over the SSE stream. Apply them here (deduped) and let
      // applyLive skip anything already counted.
      const incoming = (data.notifications ?? []).filter(
        (n) => n.id != null
      ) as Array<NewsNotification & { id: string }>;
      set((s) => {
        const known = new Set(s.inbox.map((n) => n.id));
        const fresh = incoming.filter((n) => !known.has(n.id));
        const seedInbox = fresh.map((n) => toInboxNotification(n));
        return {
          activeReport: data.contextReport ?? null,
          activeNotifications: data.notifications ?? [],
          inbox: [...seedInbox, ...s.inbox].slice(0, 200),
          unreadCount: s.unreadCount + seedInbox.length,
        };
      });
      return {
        notifications: data.notifications ?? [],
        contextReport: data.contextReport,
      };
    } catch {
      return null;
    }
  },

  applyLive: (notification) => {
    set((s) => {
      // SSE redelivers notifications already seeded by reportLocation; skip
      // them so the unread counter is never double-counted.
      if (s.inbox.some((n) => n.id === notification.id)) return s;
      const next = [notification, ...s.inbox].slice(0, 200);
      return {
        inbox: next,
        unreadCount: notification.isRead ? s.unreadCount : s.unreadCount + 1,
      };
    });
  },

  reset: () =>
    set({
      unreadCount: 0,
      inbox: [],
      recentTotal: 0,
      reports: [],
      activeReport: null,
      activeNotifications: [],
      preferences: null,
      isConnected: false,
      error: null,
    }),
}));

let streamHandle: { abort: () => void } | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let reconnectAttempts = 0;
let disposed = false;

const RECONNECT_BASE_MS = 2000;
const RECONNECT_MAX_MS = 30000;

/** Open (or reuse) the realtime notification SSE stream while authenticated. */
export function connectNotificationStream(): () => void {
  const auth = useAuthStore.getState();
  if (!auth.accessToken) return () => {};
  if (streamHandle) return () => {};
  disposed = false;

  const startStream = () => {
    // Re-check auth on (re)connect; stop retrying once logged out / disposed.
    if (disposed || !useAuthStore.getState().accessToken) return;
    const { stream, abort } = notificationsApi.streamNotifications();
    streamHandle = { abort };

    void (async () => {
      try {
        reconnectAttempts = 0;
        for await (const payload of stream) {
          const p = payload as Record<string, unknown>;
          if (p?.type === "notification") {
            const notification = p.notification as InboxNotification;
            useNotificationStore.getState().applyLive(notification);
          }
        }
      } catch {
        // stream failed/aborted — schedule reconnect below
      } finally {
        streamHandle = null;
        useNotificationStore.setState({ isConnected: false });
        if (!disposed && reconnectTimer == null) scheduleReconnect();
      }
    })();

    useNotificationStore.setState({ isConnected: true });
  };

  const scheduleReconnect = () => {
    if (reconnectTimer != null) return;
    const delay = Math.min(
      RECONNECT_BASE_MS * 2 ** reconnectAttempts,
      RECONNECT_MAX_MS
    );
    reconnectAttempts += 1;
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      if (streamHandle) return;
      startStream();
    }, delay);
  };

  startStream();

  return () => {
    disposed = true;
    if (reconnectTimer != null) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    reconnectAttempts = 0;
    streamHandle?.abort();
    streamHandle = null;
    useNotificationStore.setState({ isConnected: false });
  };
}