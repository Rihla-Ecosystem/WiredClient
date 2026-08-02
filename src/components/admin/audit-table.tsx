"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Search, Clock } from "lucide-react";

interface AuditEntry {
  id: string;
  action: string;
  actor: string;
  target: string;
  timestamp: string;
  details: string;
}

interface AuditTableProps {
  entries: AuditEntry[];
}

export function AuditTable({ entries }: AuditTableProps) {
  const t = useTranslations("admin");
  const [search, setSearch] = useState("");

  const filtered = entries.filter(
    (e) =>
      e.action.toLowerCase().includes(search.toLowerCase()) ||
      e.actor.toLowerCase().includes(search.toLowerCase()) ||
      e.target.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search audit logs..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-sand/60 dark:border-nile-light/40 bg-white dark:bg-nile-light text-nile dark:text-sand placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-sand/50 dark:border-nile-light/20">
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Action</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Actor</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Target</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Details</th>
              <th className="text-right py-3 px-4 text-muted-foreground font-medium">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-muted-foreground">
                  {t("noLogs")}
                </td>
              </tr>
            ) : (
              filtered.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-b border-sand/30 dark:border-nile-light/10 hover:bg-sand/10 dark:hover:bg-nile-light/5 transition-colors"
                >
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-sand/30 dark:bg-nile-light/20 text-muted-foreground font-medium">
                      {entry.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-nile dark:text-sand">{entry.actor}</td>
                  <td className="py-3 px-4 text-muted-foreground">{entry.target}</td>
                  <td className="py-3 px-4 text-muted-foreground max-w-xs truncate">
                    {entry.details}
                  </td>
                  <td className="py-3 px-4 text-right text-muted-foreground text-xs">
                    <span className="flex items-center justify-end gap-1">
                      <Clock className="w-3 h-3" />
                      {entry.timestamp}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
