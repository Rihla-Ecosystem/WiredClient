"use client";

import { useState, useEffect, useCallback } from "react";
import { Activity, Loader2, RefreshCw, Server, Database, Boxes } from "lucide-react";

import { adminApi, type SystemHealth } from "@/lib/api/admin";
import { cn } from "@/lib/utils/cn";

const STATUS_STYLE: Record<string, string> = {
  ok: "bg-green-500",
  degraded: "bg-amber-500",
  down: "bg-red-500",
  error: "bg-red-500",
  not_initialized: "bg-gray-400",
};

function statusLabel(status: string) {
  switch (status) {
    case "ok":
      return "Operational";
    case "degraded":
      return "Degraded";
    case "down":
      return "Down";
    case "not_initialized":
      return "Not initialized";
    default:
      return status;
  }
}

export default function AdminSystemHealthPage() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const { data } = await adminApi.getSystemHealth();
      setHealth(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load system health");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await adminApi.getSystemHealth();
        if (!cancelled) setHealth(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load system health");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-gold" />
          <h1 className="text-2xl font-serif font-bold text-nile dark:text-sand">
            System Health
          </h1>
        </div>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            void load();
          }}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-sand/60 dark:border-nile-light/40 text-sm font-medium text-muted-foreground hover:text-nile dark:hover:text-sand transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {loading && health === null ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-gold" />
        </div>
      ) : error && health === null ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-red-600 dark:text-red-300 text-sm">
          {error}
        </div>
      ) : health ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {health.services.map((svc) => (
              <div
                key={svc.name}
                className="bg-white dark:bg-nile rounded-2xl border border-sand/50 dark:border-nile-light/20 p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-gold" />
                    <span className="font-medium text-nile dark:text-sand text-sm">
                      {svc.name}
                    </span>
                  </div>
                  <span className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "w-2.5 h-2.5 rounded-full",
                        STATUS_STYLE[svc.status] ?? "bg-gray-400"
                      )}
                    />
                    <span className="text-xs text-muted-foreground">
                      {statusLabel(svc.status)}
                    </span>
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate" title={svc.url}>
                  {svc.url}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {svc.latencyMs} ms
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {health.models
              .filter((m) => m.models.length > 0)
              .map((group) => (
                <div
                  key={group.service}
                  className="bg-white dark:bg-nile rounded-2xl border border-sand/50 dark:border-nile-light/20 p-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    {group.kind === "vector" ? (
                      <Boxes className="w-4 h-4 text-gold" />
                    ) : (
                      <Database className="w-4 h-4 text-gold" />
                    )}
                    <h2 className="text-lg font-serif font-bold text-nile dark:text-sand">
                      {group.service} · {group.kind === "vector" ? "Vector collections" : "Models"}
                    </h2>
                  </div>
                  {group.available === false ? (
                    <div className="text-sm text-amber-600 dark:text-amber-400">
                      Models unavailable
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-sand/50 dark:border-nile-light/20">
                            <th className="text-left py-2 px-3 text-muted-foreground font-medium">Name</th>
                            <th className="text-right py-2 px-3 text-muted-foreground font-medium">Records</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.models.map((m) => (
                            <tr
                              key={m.table}
                              className="border-b border-sand/30 dark:border-nile-light/10"
                            >
                              <td className="py-2 px-3 text-nile dark:text-sand">
                                {m.name}
                              </td>
                              <td className="py-2 px-3 text-right text-muted-foreground">
                                {m.count === null ? "—" : m.count.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
