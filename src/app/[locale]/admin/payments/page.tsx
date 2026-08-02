"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  adminApi,
  type PaymentsResponse,
} from "@/lib/api/admin";
import { cn } from "@/lib/utils/cn";

const STATUS_BADGE: Record<string, string> = {
  COMPLETED: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
  PENDING: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
  FAILED: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
  CANCELLED: "bg-gray-100 dark:bg-gray-800 text-muted-foreground",
  REFUNDED: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
};

export default function AdminPaymentsPage() {
  const [data, setData] = useState<PaymentsResponse | null>(null);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const listRes = await adminApi.getPayments({
          page,
          limit: 20,
          status: status || undefined,
        });
        if (cancelled) return;
        setData(listRes.data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load payments");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page, status]);

  const pagination = data?.pagination;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex items-center gap-2 mb-8">
        <CreditCard className="w-6 h-6 text-gold" />
        <h1 className="text-2xl font-serif font-bold text-nile dark:text-sand">
          Payments
        </h1>
      </div>

      {loading && !data ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-gold" />
        </div>
      ) : error && !data ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-red-600 dark:text-red-300 text-sm">
          {error}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white dark:bg-nile rounded-2xl border border-sand/50 dark:border-nile-light/20 p-6">
            <div className="flex items-center gap-1.5 mb-4">
              {["", "COMPLETED", "PENDING", "FAILED", "REFUNDED"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setStatus(s);
                    setPage(1);
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                    status === s
                      ? "bg-gold text-white border-gold"
                      : "border-sand/60 dark:border-nile-light/40 text-muted-foreground hover:text-nile dark:hover:text-sand"
                  )}
                >
                  {s === "" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {error && <div className="mb-4 text-sm text-red-600 dark:text-red-300">{error}</div>}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-sand/50 dark:border-nile-light/20">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">User</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Package</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">Amount</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Provider</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.items ?? []).length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-muted-foreground">
                        No payments found
                      </td>
                    </tr>
                  ) : (
                    (data?.items ?? []).map((p) => (
                      <tr
                        key={p.id}
                        className="border-b border-sand/30 dark:border-nile-light/10 hover:bg-sand/10 dark:hover:bg-nile-light/5 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <p className="text-nile dark:text-sand font-medium">{p.user?.displayName ?? "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">{p.user?.email ?? "—"}</p>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {p.packageName}
                          <span className="text-xs"> · {p.tokens.toLocaleString()} tokens</span>
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-nile dark:text-sand">
                          {p.amount.toLocaleString()} {p.currency}
                        </td>
                        <td className="py-3 px-4">
                          <span className={cn("inline-flex text-xs px-2 py-0.5 rounded-full font-medium", STATUS_BADGE[p.status] ?? "bg-gray-100 text-muted-foreground")}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground text-xs">{p.provider}</td>
                        <td className="py-3 px-4 text-right text-xs text-muted-foreground">
                          {p.paidAt
                            ? new Date(p.paidAt).toLocaleDateString()
                            : new Date(p.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg border border-sand/60 dark:border-nile-light/40 text-muted-foreground disabled:opacity-40 hover:text-nile dark:hover:text-sand transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={page >= (pagination.totalPages ?? 1)}
                    onClick={() => setPage((p) => p + 1)}
                    className="p-1.5 rounded-lg border border-sand/60 dark:border-nile-light/40 text-muted-foreground disabled:opacity-40 hover:text-nile dark:hover:text-sand transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
