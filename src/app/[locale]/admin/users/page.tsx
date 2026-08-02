"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Users, Loader2 } from "lucide-react";

import { UsersTable } from "@/components/admin/users-table";
import { adminApi, type AdminUserRecord } from "@/lib/api/admin";

interface AdminUser {
  id: string;
  displayName: string;
  email: string;
  role: "user" | "moderator" | "admin";
  roleId?: number;
  isBanned: boolean;
  createdAt: string;
}

function roleName(role: unknown): AdminUser["role"] {
  const name =
    typeof role === "object" && role
      ? (role as { name?: string }).name
      : role;
  if (name === "admin") return "admin";
  if (name === "moderator") return "moderator";
  return "user";
}

function mapUser(u: AdminUserRecord): AdminUser {
  return {
    id: u.id,
    displayName: u.displayName,
    email: u.email,
    role: roleName(u.role),
    roleId: u.roleId,
    isBanned: !!u.isBanned,
    createdAt: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "",
  };
}

export default function AdminUsersPage() {
  const t = useTranslations("admin");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const { data } = await adminApi.getUsers();
      setUsers((data || []).map(mapUser));
      setNotice(null);
    } catch {
      setUsers([]);
      setNotice({ type: "error", message: "Failed to load users" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const { data } = await adminApi.getUsers();
        if (cancelled) return;
        setUsers((data || []).map(mapUser));
      } catch {
        if (!cancelled) setNotice({ type: "error", message: "Failed to load users" });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleToggleBan = async (user: AdminUser) => {
    try {
      if (user.isBanned) {
        await adminApi.unbanUser(user.id);
        setNotice({ type: "success", message: `${user.displayName} unbanned` });
      } else {
        await adminApi.banUser(user.id);
        setNotice({ type: "success", message: `${user.displayName} banned` });
      }
      await load();
    } catch {
      setNotice({ type: "error", message: `Failed to ${user.isBanned ? "unban" : "ban"} ${user.displayName}` });
    }
  };

  const handleRoleChange = async (user: AdminUser, roleId: number) => {
    try {
      await adminApi.changeUserRole(user.id, roleId);
      setNotice({ type: "success", message: `Role updated for ${user.displayName}` });
      await load();
    } catch {
      setNotice({ type: "error", message: `Failed to change role for ${user.displayName}` });
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex items-center gap-2 mb-8">
        <Users className="w-6 h-6 text-gold" />
        <h1 className="text-2xl font-serif font-bold text-nile dark:text-sand">
          {t("users")}
        </h1>
      </div>

      {notice && (
        <div
          className={`mb-4 px-4 py-3 rounded-xl text-sm border ${
            notice.type === "success"
              ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
              : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-300"
          }`}
        >
          {notice.message}
        </div>
      )}

      <div className="bg-white dark:bg-nile rounded-2xl border border-sand/50 dark:border-nile-light/20 p-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-gold" />
          </div>
        ) : (
          <UsersTable users={users} onToggleBan={handleToggleBan} onRoleChange={handleRoleChange} />
        )}
      </div>
    </div>
  );
}
