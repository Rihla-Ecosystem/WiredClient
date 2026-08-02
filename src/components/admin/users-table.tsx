"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Search, Ban, CheckCircle2, Shield, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface AdminUser {
  id: string;
  displayName: string;
  email: string;
  role: "user" | "moderator" | "admin";
  roleId?: number;
  isBanned: boolean;
  createdAt: string;
}

interface UsersTableProps {
  users: AdminUser[];
  onToggleBan?: (user: AdminUser) => void;
  onRoleChange?: (user: AdminUser, roleId: number) => Promise<void> | void;
}

const ROLE_OPTIONS = [
  { value: 1, label: "User" },
  { value: 2, label: "Moderator" },
  { value: 3, label: "Admin" },
];

export function UsersTable({ users, onToggleBan, onRoleChange }: UsersTableProps) {
  const t = useTranslations("admin");
  const [search, setSearch] = useState("");
  const [busyUserId, setBusyUserId] = useState<string | null>(null);

  const filtered = users.filter(
    (u) =>
      u.displayName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleRoleChange = async (user: AdminUser, roleId: number) => {
    if (!onRoleChange) return;
    setBusyUserId(user.id);
    try {
      await onRoleChange(user, roleId);
    } finally {
      setBusyUserId(null);
    }
  };

  return (
    <div>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("searchUsers")}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-sand/60 dark:border-nile-light/40 bg-white dark:bg-nile-light text-nile dark:text-sand placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-sand/50 dark:border-nile-light/20">
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Name</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Email</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Role</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
              <th className="text-right py-3 px-4 text-muted-foreground font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-muted-foreground">
                  {t("noUsers")}
                </td>
              </tr>
            ) : (
              filtered.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-sand/30 dark:border-nile-light/10 hover:bg-sand/10 dark:hover:bg-nile-light/5 transition-colors"
                >
                  <td className="py-3 px-4 text-nile dark:text-sand font-medium">
                    {user.displayName}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{user.email}</td>
                  <td className="py-3 px-4">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium",
                        user.role === "admin"
                          ? "bg-gold/10 text-gold"
                          : user.role === "moderator"
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                          : "bg-sand/30 text-muted-foreground"
                      )}
                    >
                      {user.role === "admin" && <Shield className="w-3 h-3" />}
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {user.isBanned ? (
                      <span className="text-xs text-red-500 flex items-center gap-1">
                        <Ban className="w-3 h-3" /> Banned
                      </span>
                    ) : (
                      <span className="text-xs text-green-500 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <select
                        value={user.roleId ?? 1}
                        disabled={busyUserId === user.id || !onRoleChange}
                        onChange={(e) => void handleRoleChange(user, Number(e.target.value))}
                        className="text-xs px-2 py-1.5 rounded-lg border border-sand/60 dark:border-nile-light/40 bg-white dark:bg-nile-light text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 disabled:opacity-50"
                      >
                        {ROLE_OPTIONS.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                      {busyUserId === user.id && <Loader2 className="w-3.5 h-3.5 animate-spin text-gold" />}
                      <button
                        type="button"
                        onClick={() => onToggleBan?.(user)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                          user.isBanned
                            ? "border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                            : "border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        }`}
                      >
                        {user.isBanned ? t("unban") : t("ban")}
                      </button>
                    </div>
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

