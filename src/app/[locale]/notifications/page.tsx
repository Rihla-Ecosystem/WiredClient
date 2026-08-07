"use client";

import { useState, useEffect, Suspense } from "react";
import { useTranslations } from "next-intl";
import {
  Bell,
  Inbox,
  FileText,
  CheckCheck,
  Trash2,
  ChevronRight,
  ShieldAlert,
  MapPin,
} from "lucide-react";

import { AuthGuard } from "@/components/layout/auth-guard";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ErrorMessage } from "@/components/shared/error-message";
import { useNotificationStore, connectNotificationStream } from "@/lib/stores/notification-store";
import type { InboxNotification, StoredContextReport } from "@/lib/api/notifications";

const PRIORITY_STYLES: Record<string, string> = {
  CRITICAL: "bg-red-100 dark:bg-red-950/50 border-red-300 dark:border-red-900/60 text-red-800 dark:text-red-200",
  HIGH: "bg-amber-50 dark:bg-amber-950/40 border-amber-300/70 dark:border-amber-800/60 text-amber-900 dark:text-amber-200",
  NORMAL: "bg-white dark:bg-nile border-sand/50 dark:border-nile-light/30 text-nile dark:text-sand",
  LOW: "bg-sand/20 dark:bg-nile-light/10 border-sand/40 dark:border-nile-light/20 text-muted-foreground",
};

export default function NotificationsPage() {
  return (
    <Suspense fallback={null}>
      <NotificationsContent />
    </Suspense>
  );
}

function NotificationsContent() {
  const t = useTranslations("notifications");
  const [tab, setTab] = useState<"inbox" | "reports">("inbox");
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [retryKey, setRetryKey] = useState(0);
  const {
    inbox,
    reports,
    recentTotal,
    activeNotifications,
    loading,
    error,
    loadInbox,
    loadReports,
    markRead,
    markAllRead,
    deleteInbox,
    refreshUnread,
  } = useNotificationStore();

  useEffect(() => {
    const disconnect = connectNotificationStream();
    void refreshUnread();
    return disconnect;
  }, [refreshUnread]);

  useEffect(() => {
    void loadInbox(filter === "unread" ? { isRead: false } : undefined);
    void refreshUnread();
  }, [filter, tab, retryKey, loadInbox, refreshUnread]);

  useEffect(() => {
    if (tab === "reports") void loadReports();
  }, [tab, loadReports]);

  const visibleInbox = filter === "unread" ? inbox.filter((n) => !n.isRead) : inbox;
  const activeHighlights = activeNotifications.length
    ? activeNotifications
    : inbox
        .filter((n) => n.priority === "CRITICAL" || n.priority === "HIGH")
        .slice(0, 3);

  return (
    <AuthGuard>
      <div className="min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-serif font-bold text-nile dark:text-sand flex items-center gap-2">
              <Bell className="w-6 h-6 text-gold" />
              {t("title")}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-sand/50 dark:border-nile-light/30 overflow-hidden">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  filter === "all"
                    ? "bg-nile dark:bg-nile-light text-white dark:text-navy"
                    : "bg-transparent text-muted-foreground hover:text-nile dark:hover:text-sand"
                }`}
              >
                {t("all")}
              </button>
              <button
                type="button"
                onClick={() => setFilter("unread")}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  filter === "unread"
                    ? "bg-nile dark:bg-nile-light text-white dark:text-navy"
                    : "bg-transparent text-muted-foreground hover:text-nile dark:hover:text-sand"
                }`}
              >
                {t("unread")}
              </button>
            </div>
            {tab === "inbox" && visibleInbox.some((n) => !n.isRead) && (
              <button
                type="button"
                onClick={() => void markAllRead()}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-sand/30 dark:bg-nile-light/20 text-nile dark:text-sand hover:bg-sand/50 dark:hover:bg-nile-light/30 transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                {t("markAllRead")}
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setTab("inbox")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === "inbox"
                ? "bg-nile text-white dark:bg-nile-light dark:text-navy"
                : "text-muted-foreground hover:bg-sand/30 dark:hover:bg-nile-light/20"
            }`}
          >
            <Inbox className="w-4 h-4" />
            {t("inbox")}
          </button>
          <button
            type="button"
            onClick={() => setTab("reports")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === "reports"
                ? "bg-navy text-white dark:bg-nile-light dark:text-navy"
                : "text-muted-foreground hover:bg-sand/30 dark:hover:bg-nile-light/20"
            }`}
          >
            <FileText className="w-4 h-4" />
            {t("reports")}
          </button>
        </div>

        {/* Live highlights (from SSE + last location report) */}
        {activeHighlights.length > 0 && tab === "inbox" && (
          <div className="mb-6 space-y-2">
            {activeHighlights.map((n, i) => (
              <div
                key={`${n.id ?? "hl"}-${i}`}
                className={`flex items-start gap-3 p-3 rounded-xl border ${
                  PRIORITY_STYLES[n.priority] ?? PRIORITY_STYLES.NORMAL
                }`}
              >
                <ShieldAlert className="w-5 h-5 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{n.title}</span>
                    {typeof n.data?.area === "string" && (
                      <span className="inline-flex items-center gap-1 text-xs opacity-70">
                        <MapPin className="w-3 h-3" />
                        {n.data.area}
                      </span>
                    )}
                  </div>
                  <p className="text-sm opacity-90 mt-0.5">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {loading && !error ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <ErrorMessage message={error} onRetry={() => setRetryKey((k) => k + 1)} />
          </div>
        ) : tab === "inbox" ? (
          visibleInbox.length === 0 && recentTotal === 0 ? (
            <div className="min-h-[30vh] flex flex-col items-center justify-center gap-3 text-center">
              <Inbox className="w-10 h-10 text-muted-foreground/50" />
              <p className="text-muted-foreground">{t("empty")}</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {visibleInbox.map((n) => (
                <InboxItem
                  key={n.id}
                  notification={n}
                  onMarkRead={() => void markRead(n.id)}
                  onDelete={() => void deleteInbox(n.id)}
                />
              ))}
              {recentTotal > visibleInbox.length && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  {t("pagingHint")}
                </p>
              )}
            </ul>
          )
        ) : reports.length === 0 ? (
          <div className="min-h-[30vh] flex flex-col items-center justify-center gap-3 text-center">
            <FileText className="w-10 h-10 text-muted-foreground/50" />
            <p className="text-muted-foreground">{t("noReports")}</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {reports.map((r) => (
              <ReportRow key={r.id} report={r} />
            ))}
          </ul>
        )}
      </div>
    </AuthGuard>
  );
}

function InboxItem({
  notification,
  onMarkRead,
  onDelete,
}: {
  notification: InboxNotification;
  onMarkRead: () => void;
  onDelete: () => void;
}) {
  const t = useTranslations("notifications");
  return (
    <li
      className={`p-4 rounded-xl border transition-colors ${
        PRIORITY_STYLES[notification.priority] ?? PRIORITY_STYLES.NORMAL
      } ${notification.isRead ? "opacity-70" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">{notification.title}</span>
            <span className="text-xs">{notification.category}</span>
            {!notification.isRead && (
              <span className="inline-block w-2 h-2 rounded-full bg-current" />
            )}
          </div>
          <p className="text-sm opacity-90 mt-1">{notification.message}</p>
          <p className="text-xs text-muted-foreground mt-2">
            {new Date(notification.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!notification.isRead && (
            <button
              type="button"
              onClick={onMarkRead}
              title={t("markRead")}
              className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onDelete}
            title={t("delete")}
            className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </li>
  );
}

function ReportRow({ report }: { report: StoredContextReport }) {
  const t = useTranslations("notifications");
  const reportBody = report.report ?? null;
  const safetyScore = reportBody?.safetyScore ?? null;
  const riskLevel = reportBody?.riskLevel ?? null;
  return (
    <li className="p-4 rounded-xl border border-sand/50 dark:border-nile-light/30 bg-white dark:bg-nile flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <MapPin className="w-4 h-4 text-gold" />
          <span className="font-semibold text-sm">
            {report.areaName || reportBody?.areaInformation?.area || t("unknownArea")}
          </span>
          {riskLevel && (
            <span className="text-xs uppercase text-muted-foreground">{riskLevel}</span>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
          {report.summary || reportBody?.aiSummary?.executiveSummary || ""}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {new Date(report.createdAt).toLocaleString()}
          {typeof safetyScore === "number" ? ` · ${t("safetyScore")}: ${safetyScore}/100` : ""}
        </p>
      </div>
      <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground" />
    </li>
  );
}