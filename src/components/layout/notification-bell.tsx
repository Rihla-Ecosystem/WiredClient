"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useNotificationStore, connectNotificationStream } from "@/lib/stores/notification-store";

const C = {
  basalt: "#141008",
  limestone: "#F5EFE0",
};

export function NotificationBell() {
  const { unreadCount, refreshUnread } = useNotificationStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      useNotificationStore.setState({ unreadCount: 0 });
      return;
    }
    void refreshUnread();
    const disconnect = connectNotificationStream();
    const poll = setInterval(() => void refreshUnread(), 60000);
    return () => {
      clearInterval(poll);
      disconnect();
    };
  }, [isAuthenticated, refreshUnread]);

  return (
    <Link
      href="/notifications"
      title="Notifications"
      aria-label="Notifications"
      style={{
        background: "rgba(245,239,224,0.07)",
        border: "1px solid rgba(245,239,224,0.16)",
        borderRadius: 10,
        width: 36,
        height: 36,
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        color: `${C.limestone}80`,
      }}
    >
      <Bell size={16} strokeWidth={1.9} style={{ animation: "rihlaWiggle 5s ease-in-out infinite" }} />
      {unreadCount > 0 && (
        <span
          style={{
            position: "absolute",
            top: -6,
            right: -6,
            minWidth: 18,
            height: 18,
            borderRadius: 9,
            background: "#C83B1A",
            color: "#fff",
            fontSize: 10,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 4px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.35)",
          }}
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}