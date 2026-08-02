"use client";

import { useState, useEffect, useCallback } from "react";
import { Cpu, Loader2, RefreshCw, DollarSign, Hash, ArrowUp, ArrowDown } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { adminApi, type AiUsageSummary } from "@/lib/api/admin";

export default function AdminAiUsagePage() {
  const [usage, setUsage] = useState<AiUsageSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const { data } = await adminApi.getAiUsage();
      setUsage(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load AI usage");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await adminApi.getAiUsage();
        if (!cancelled) setUsage(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load AI usage");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const s = usage?.summary;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Cpu className="w-6 h-6 text-gold" />
          <h1 className="text-2xl font-serif font-bold text-nile dark:text-sand">
            AI Usage
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

      {loading && !usage ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-gold" />
        </div>
      ) : error && !usage ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-red-600 dark:text-red-300 text-sm">
          {error}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-nile rounded-2xl border border-sand/50 dark:border-nile-light/20 p-5">
              <Hash className="w-8 h-8 p-1.5 rounded-lg text-white bg-purple-500 mb-3" />
              <p className="text-xl font-bold text-nile dark:text-sand">{(s?.totalCalls ?? 0).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Total calls</p>
            </div>
            <div className="bg-white dark:bg-nile rounded-2xl border border-sand/50 dark:border-nile-light/20 p-5">
              <ArrowUp className="w-8 h-8 p-1.5 rounded-lg text-white bg-blue-500 mb-3" />
              <p className="text-xl font-bold text-nile dark:text-sand">{(s?.inputTokens ?? 0).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Input tokens</p>
            </div>
            <div className="bg-white dark:bg-nile rounded-2xl border border-sand/50 dark:border-nile-light/20 p-5">
              <ArrowDown className="w-8 h-8 p-1.5 rounded-lg text-white bg-teal-500 mb-3" />
              <p className="text-xl font-bold text-nile dark:text-sand">{(s?.outputTokens ?? 0).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Output tokens</p>
            </div>
            <div className="bg-white dark:bg-nile rounded-2xl border border-sand/50 dark:border-nile-light/20 p-5">
              <DollarSign className="w-8 h-8 p-1.5 rounded-lg text-white bg-gold mb-3" />
              <p className="text-xl font-bold text-nile dark:text-sand">${(s?.cost ?? 0).toFixed(4)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Estimated cost</p>
            </div>
          </div>

          <div className="bg-white dark:bg-nile rounded-2xl border border-sand/50 dark:border-nile-light/20 p-6">
            <h2 className="text-lg font-serif font-bold text-nile dark:text-sand mb-6">
              Daily Token Usage
            </h2>
            <div className="h-72">
              {(usage?.daily ?? []).length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                  No AI usage yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={usage?.daily ?? []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="day" stroke="#9ca3af" fontSize={11} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="inputTokens" name="Input" stackId="a" fill="#0F4C5C" />
                    <Bar dataKey="outputTokens" name="Output" stackId="a" fill="#C9954A" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-nile rounded-2xl border border-sand/50 dark:border-nile-light/20 p-6">
              <h2 className="text-lg font-serif font-bold text-nile dark:text-sand mb-4">By Model</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-sand/50 dark:border-nile-light/20">
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">Model</th>
                      <th className="text-right py-2 px-3 text-muted-foreground font-medium">Calls</th>
                      <th className="text-right py-2 px-3 text-muted-foreground font-medium">Tokens</th>
                      <th className="text-right py-2 px-3 text-muted-foreground font-medium">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(usage?.perModel ?? []).map((m, i) => (
                      <tr key={`${m.model}-${m.source}-${i}`} className="border-b border-sand/30 dark:border-nile-light/10">
                        <td className="py-2 px-3">
                          <p className="text-nile dark:text-sand font-medium">{m.model || "unknown"}</p>
                          <p className="text-xs text-muted-foreground">{m.source}</p>
                        </td>
                        <td className="py-2 px-3 text-right text-muted-foreground">{m.calls}</td>
                        <td className="py-2 px-3 text-right text-muted-foreground">{m.totalTokens.toLocaleString()}</td>
                        <td className="py-2 px-3 text-right font-medium text-nile dark:text-sand">${m.cost.toFixed(4)}</td>
                      </tr>
                    ))}
                    {(usage?.perModel ?? []).length === 0 && (
                      <tr><td colSpan={4} className="text-center py-6 text-muted-foreground">No data</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white dark:bg-nile rounded-2xl border border-sand/50 dark:border-nile-light/20 p-6">
              <h2 className="text-lg font-serif font-bold text-nile dark:text-sand mb-4">By User</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-sand/50 dark:border-nile-light/20">
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">User</th>
                      <th className="text-right py-2 px-3 text-muted-foreground font-medium">Calls</th>
                      <th className="text-right py-2 px-3 text-muted-foreground font-medium">Tokens</th>
                      <th className="text-right py-2 px-3 text-muted-foreground font-medium">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(usage?.perUser ?? []).map((u, i) => (
                      <tr key={u.user?.id ?? i} className="border-b border-sand/30 dark:border-nile-light/10">
                        <td className="py-2 px-3">
                          <p className="text-nile dark:text-sand font-medium">{u.user?.displayName ?? "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">{u.user?.email ?? "—"}</p>
                        </td>
                        <td className="py-2 px-3 text-right text-muted-foreground">{u.calls}</td>
                        <td className="py-2 px-3 text-right text-muted-foreground">{u.totalTokens.toLocaleString()}</td>
                        <td className="py-2 px-3 text-right font-medium text-nile dark:text-sand">${u.cost.toFixed(4)}</td>
                      </tr>
                    ))}
                    {(usage?.perUser ?? []).length === 0 && (
                      <tr><td colSpan={4} className="text-center py-6 text-muted-foreground">No data</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {((usage?.recent ?? []).length ?? 0) > 0 && (
            <div className="bg-white dark:bg-nile rounded-2xl border border-sand/50 dark:border-nile-light/20 p-6">
              <h2 className="text-lg font-serif font-bold text-nile dark:text-sand mb-4">Recent Calls</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-sand/50 dark:border-nile-light/20">
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">User</th>
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">Source</th>
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">Model</th>
                      <th className="text-right py-2 px-3 text-muted-foreground font-medium">Tokens</th>
                      <th className="text-right py-2 px-3 text-muted-foreground font-medium">Cost</th>
                      <th className="text-right py-2 px-3 text-muted-foreground font-medium">When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(usage?.recent ?? []).map((r) => (
                      <tr key={r.id} className="border-b border-sand/30 dark:border-nile-light/10">
                        <td className="py-2 px-3 text-nile dark:text-sand">
                          {r.user?.displayName ?? r.user?.email ?? "Unknown"}
                        </td>
                        <td className="py-2 px-3 text-muted-foreground">{r.source}</td>
                        <td className="py-2 px-3 text-muted-foreground">{r.model ?? "—"}</td>
                        <td className="py-2 px-3 text-right text-muted-foreground">{r.totalTokens.toLocaleString()}</td>
                        <td className="py-2 px-3 text-right text-muted-foreground">${r.cost.toFixed(4)}</td>
                        <td className="py-2 px-3 text-right text-xs text-muted-foreground">
                          {new Date(r.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
