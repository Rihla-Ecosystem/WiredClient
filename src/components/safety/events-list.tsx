"use client";

import { AlertTriangle, AlertCircle, Info, Shield } from "lucide-react";
import { useTranslations } from "next-intl";

interface SafetyEvent {
  id: string;
  type: "advisory" | "warning" | "critical" | "info";
  title: string;
  description: string;
  source: string;
  timestamp: string;
  location?: string;
}

interface EventsListProps {
  events: SafetyEvent[];
}

const EVENT_CONFIG = {
  advisory: {
    icon: AlertTriangle,
    color: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    border: "border-yellow-200 dark:border-yellow-800",
  },
  warning: {
    icon: AlertCircle,
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-900/20",
    border: "border-orange-200 dark:border-orange-800",
  },
  critical: {
    icon: Shield,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-900/20",
    border: "border-red-200 dark:border-red-800",
  },
  info: {
    icon: Info,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800",
  },
};

export function EventsList({ events }: EventsListProps) {
  const t = useTranslations("safety");

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
        {t("noEvents")}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event, index) => {
        const cfg = EVENT_CONFIG[event.type] ?? EVENT_CONFIG.info;
        const Icon = cfg.icon;
        return (
          <div
            key={`${event.id}-${index}`}
            className={`p-4 rounded-xl border ${cfg.bg} ${cfg.border}`}
          >
            <div className="flex items-start gap-3">
              <Icon className={`w-5 h-5 mt-0.5 ${cfg.color}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold uppercase ${cfg.color}`}>
                    {t(event.type)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {event.timestamp}
                  </span>
                </div>
                <h4 className="font-medium text-nile dark:text-sand text-sm mt-1">
                  {event.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {event.description}
                </p>
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <span>{event.source}</span>
                  {event.location && (
                    <>
                      <span>·</span>
                      <span>{event.location}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
