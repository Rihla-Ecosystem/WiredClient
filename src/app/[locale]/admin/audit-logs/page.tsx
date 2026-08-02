"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { ClipboardList, Loader2 } from "lucide-react";

import { AuditTable } from "@/components/admin/audit-table";
import { adminApi, type AuditLogRecord } from "@/lib/api/admin";

function mapLog(log: AuditLogRecord) {
  const metadata =
    log.metadata && typeof log.metadata === "object"
      ? JSON.stringify(log.metadata)
      : null;
  return {
    id: log.id,
    action: String(log.action || "").toUpperCase(),
    actor: log.actor?.displayName || log.actor?.email || "system",
    target:
      log.target?.displayName || log.target?.email || log.targetUserId || "-",
    timestamp: log.createdAt ? new Date(log.createdAt).toLocaleString() : "",
    details: metadata || String(log.action || "").replace(/_/g, " "),
  };
}

interface AuditEntry {
  id: string;
  action: string;
  actor: string;
  target: string;
  timestamp: string;
  details: string;
}

export default function AdminAuditLogsPage() {
  const t = useTranslations("admin");
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await adminApi.getAuditLogs();
        if (!cancelled) setEntries((data || []).map(mapLog));
      } catch {
        if (!cancelled) setEntries([]);
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
      <div className="flex items-center gap-2 mb-8">
        <ClipboardList className="w-6 h-6 text-gold" />
        <h1 className="text-2xl font-serif font-bold text-nile dark:text-sand">
          {t("auditLogs")}
        </h1>
      </div>

      <div className="bg-white dark:bg-nile rounded-2xl border border-sand/50 dark:border-nile-light/20 p-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-gold" />
          </div>
        ) : (
          <AuditTable entries={entries} />
        )}
      </div>
    </div>
  );
}
