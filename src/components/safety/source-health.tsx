"use client";

import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";

interface Source {
  name: string;
  status: "healthy" | "degraded" | "down";
  lastUpdate: string;
  category: string;
}

interface SourceHealthProps {
  sources: Source[];
}

const STATUS_CONFIG = {
  healthy: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20" },
  degraded: { icon: AlertTriangle, color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-900/20" },
  down: { icon: XCircle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20" },
};

export function SourceHealth({ sources }: SourceHealthProps) {
  const t = useTranslations("safety");

  if (sources.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        {t("noData")}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sources.map((source) => {
        const cfg = STATUS_CONFIG[source.status];
        const Icon = cfg.icon;
        return (
          <div
            key={source.name}
            className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-nile border border-sand/50 dark:border-nile-light/20"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Icon className={`w-4 h-4 flex-shrink-0 ${cfg.color}`} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-nile dark:text-sand truncate">
                  {source.name}
                </p>
                <p className="text-xs text-muted-foreground">{source.category}</p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground flex-shrink-0">
              {source.lastUpdate}
            </span>
          </div>
        );
      })}
    </div>
  );
}
