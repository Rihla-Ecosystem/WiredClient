"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { MapPin, ShieldAlert, ShieldCheck, X } from "lucide-react";
import { useAreaNotice } from "@/lib/hooks/use-area-notice";

export function SensitiveAreaNotice() {
  const t = useTranslations("guide");
  const [dismissed, setDismissed] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const resolvingRef = useRef(false);

  useEffect(() => {
    if (coords || resolvingRef.current) return;
    if (!("geolocation" in navigator)) return;
    resolvingRef.current = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => undefined,
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [coords]);

  const { data: notice } = useAreaNotice(coords?.lat, coords?.lng);

  if (!notice?.active || dismissed) return null;

  const classes: Record<string, { bar: string; chip: string }> = {
    critical: { bar: "bg-red-600", chip: "bg-red-700" },
    warning: { bar: "bg-amber-500", chip: "bg-amber-600" },
    info: { bar: "bg-faience", chip: "bg-faience-dark" },
  };
  const pal = classes[notice.severity ?? "warning"] ?? classes.warning;

  const Icon = notice.severity === "info" ? ShieldCheck : ShieldAlert;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[1200] w-[calc(100%-2rem)] max-w-md rounded-xl shadow-lg border overflow-hidden">
      <div className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold text-white ${pal.chip}`}>
        <Icon className="w-4 h-4" />
        <span className="uppercase tracking-wide">{t(`class.${notice.class ?? "protected"}`)}</span>
        <span className="ml-auto flex items-center gap-1 font-normal">
          <MapPin className="w-3.5 h-3.5" />
          {notice.distance_meters !== undefined
            ? t("distance", { distance: Math.round(notice.distance_meters) })
            : null}
        </span>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="p-0.5 rounded hover:bg-white/20 transition-colors"
          aria-label={t("dismiss")}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className={`px-3 py-2.5 text-sm text-white ${pal.bar}`}>
        {t(`area.${notice.class}.body`, {
          defaultValue: t("area.generic"),
        })}
      </div>
    </div>
  );
}