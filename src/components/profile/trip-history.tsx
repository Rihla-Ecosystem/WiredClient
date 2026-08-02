"use client";

import { useTranslations } from "next-intl";
import { MapPin, CalendarDays } from "lucide-react";

interface Trip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  type: string;
  sites: number;
}

interface TripHistoryProps {
  trips: Trip[];
}

export function TripHistory({ trips }: TripHistoryProps) {
  const t = useTranslations("profile");

  if (trips.length === 0) {
    return (
      <div className="text-center py-8">
        <MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
        <p className="text-sm text-muted-foreground">{t("noTrips")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {trips.map((trip) => (
        <div
          key={trip.id}
          className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-nile border border-sand/50 dark:border-nile-light/20"
        >
          <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5 text-gold" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-nile dark:text-sand text-sm">
              {trip.destination}
            </h4>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <CalendarDays className="w-3 h-3" />
              {trip.startDate} — {trip.endDate}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-xs text-muted-foreground">{trip.type}</div>
            <div className="text-xs text-muted-foreground">
              {trip.sites} sites
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
