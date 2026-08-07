"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { MapPin, ShieldAlert, ShieldCheck, X, Loader2, Bell } from "lucide-react";
import Link from "next/link";
import { useNotificationStore } from "@/lib/stores/notification-store";
import type { GeneratedNotification } from "@/lib/api/notifications";

/**
 * Reports the user's current location to the Context Engine (Core-Server),
 * which aggregates geo/risk/profile context and runs the AI analysis
 * (ai-service `/context/analyze`). Surfaces generated CRITICAL/HIGH
 * notifications inline so the traveller sees area alerts without leaving chat.
 */
export function ContextAlert() {
  const t = useTranslations("notifications");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [reporting, setReporting] = useState(false);
  const resolvingRef = useRef(false);
  const reportedRef = useRef(false);
  const { activeNotifications, reportLocation } = useNotificationStore();

  useEffect(() => {
    if (coords || resolvingRef.current) return;
    if (!("geolocation" in navigator)) return;
    resolvingRef.current = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {
        resolvingRef.current = false;
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 120000 }
    );
  }, [coords]);

  useEffect(() => {
    if (!coords || reportedRef.current) return;
    reportedRef.current = true;
    setReporting(true);
    void reportLocation({
      lat: coords.lat,
      lng: coords.lng,
      reason: "initial",
    }).finally(() => setReporting(false));
  }, [coords, reportLocation]);

  if (dismissed) return null;

  const highlights: GeneratedNotification[] = (activeNotifications ?? []).filter(
    (n) => n.priority === "CRITICAL" || n.priority === "HIGH"
  );

  if (highlights.length === 0 && !reporting) return null;

  return (
    <div className="mb-4 space-y-2">
      {reporting && (
        <div className="flex items-center gap-2 rounded-xl border border-sand/50 dark:border-nile-light/20 bg-sand/20 dark:bg-nile/60 px-4 py-2.5 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          {t("analyzingArea")}
          <MapPin className="w-3.5 h-3.5 ml-auto" />
        </div>
      )}
      {highlights.map((n, i) => {
        const critical = n.priority === "CRITICAL";
        return (
          <div
            key={`${n.id ?? "ctx"}-${i}`}
            className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${
              critical
                ? "bg-red-50 dark:bg-red-950/50 border-red-300 dark:border-red-900/60 text-red-900 dark:text-red-100"
                : "bg-amber-50 dark:bg-amber-950/40 border-amber-300/70 dark:border-amber-800/60 text-amber-900 dark:text-amber-100"
            }`}
          >
            {critical ? (
              <ShieldAlert className="w-5 h-5 mt-0.5 shrink-0" />
            ) : (
              <ShieldCheck className="w-5 h-5 mt-0.5 shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm">{n.title}</span>
                <span className="text-xs opacity-70 uppercase">{n.priority}</span>
              </div>
              <p className="text-sm opacity-90 mt-0.5">{n.message}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Link
                href="/notifications"
                title={t("openInbox")}
                className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              >
                <Bell className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={() => setDismissed(true)}
                className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                aria-label={t("dismiss")}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}