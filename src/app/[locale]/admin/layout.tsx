"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Activity,
  CreditCard,
  Cpu,
  Users,
  ClipboardList,
  Map,
  ArrowLeft,
} from "lucide-react";

import { AdminGuard } from "@/components/layout/admin-guard";
import { cn } from "@/lib/utils/cn";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/system-health", label: "System Health", icon: Activity },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/ai-usage", label: "AI Usage", icon: Cpu },
  { href: "/admin/geo", label: "Geo Sites", icon: Map },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: ClipboardList },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <AdminGuard>
      <div className="flex min-h-[calc(100vh-4rem)]">
        <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-sand/40 dark:border-nile-light/20 bg-white/60 dark:bg-nile-light/5 backdrop-blur p-4 sticky top-16 self-start min-h-[calc(100vh-4rem)]">
          <div className="px-2 mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-gold">
              Admin Panel
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">Rihla</p>
          </div>
          <nav className="flex-1 space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = item.exact
                ? pathname === item.href ||
                  pathname === `${item.href}/`
                : pathname.includes(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-gold/15 text-gold"
                      : "text-muted-foreground hover:text-nile dark:hover:text-sand hover:bg-sand/20 dark:hover:bg-nile-light/10"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-nile dark:hover:text-sand hover:bg-sand/20 dark:hover:bg-nile-light/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to app
          </Link>
        </aside>

        {/* Mobile nav */}
        <nav className="md:hidden sticky top-16 z-40 bg-white/90 dark:bg-nile/90 backdrop-blur border-b border-sand/40 dark:border-nile-light/20 px-2 py-2 overflow-x-auto flex gap-1">
          {NAV_ITEMS.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.includes(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  active
                    ? "bg-gold/15 text-gold"
                    : "text-muted-foreground hover:text-nile dark:hover:text-sand"
                )}
              >
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </AdminGuard>
  );
}
