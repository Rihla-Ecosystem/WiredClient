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
    contextReport: ContextReport;
  } | null>;
  applyLive: (notification: InboxNotification) => void;
  reset: () => void;
}

let streamHandle: { abort: () => void } | null = null;

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
      set({
        activeReport: data.contextReport ?? null,
        activeNotifications: data.notifications ?? [],
        unreadCount: get().unreadCount + (data.notifications?.length ?? 0),
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

/** Open (or reuse) the realtime notification SSE stream while authenticated. */
export function connectNotificationStream(): () => void {
  const auth = useAuthStore.getState();
  if (!auth.accessToken) return () => {};
  if (streamHandle) return () => {};

  const { stream, abort } = notificationsApi.streamNotifications();
  streamHandle = { abort };

  void (async () => {
    try {
      for await (const payload of stream) {
        const p = payload as Record<string, unknown>;
        if (p?.type === "notification") {
          const notification = p.notification as InboxNotification;
          useNotificationStore.getState().applyLive(notification);
        }
      }
    } catch {
      // stream closed/aborted — caller reconnects on demand
    } finally {
      streamHandle = null;
      useNotificationStore.setState({ isConnected: false });
    }
  })();

  useNotificationStore.setState({ isConnected: true });
  return () => {
    streamHandle?.abort();
    streamHandle = null;
    useNotificationStore.setState({ isConnected: false });
  };
}