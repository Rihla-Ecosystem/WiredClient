"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Users,
  MessageSquare,
  DollarSign,
  Activity,
  BarChart3,
  Cpu,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import { StatsCards } from "@/components/admin/stats-cards";
import { adminApi, type AiUsageSummary, type AdminStats } from "@/lib/api/admin";

const COLORS = ["#C9954A", "#0F4C5C", "#C25A3C", "#7A9E7E", "#8B7FB7"];

export default function AdminDashboardPage() {
  const t = useTranslations("admin");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [monthly, setMonthly] = useState<{ name: string; users: number; chats: number }[]>([]);
  const [aiUsage, setAiUsage] = useState<AiUsageSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [statsRes, monthlyRes, aiRes] = await Promise.all([
          adminApi.getStats(),
          adminApi.getMonthlyStats(),
          adminApi.getAiUsage(),
        ]);
        if (cancelled) return;
        setStats(statsRes.data);
        setMonthly(monthlyRes.data.data || []);
        setAiUsage(aiRes.data);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load dashboard");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const statCards = stats
    ? [
        { label: "Total Users", value: stats.totalUsers.toLocaleString(), change: "All time", icon: Users, color: "bg-blue-500" },
        { label: "Active Today", value: stats.activeToday.toLocaleString(), change: "Last 24h", icon: Activity, color: "bg-green-500" },
        { label: "Total Chats", value: stats.totalChats.toLocaleString(), change: "All time", icon: MessageSquare, color: "bg-purple-500" },
        { label: "Revenue", value: `${stats.revenue.toLocaleString()} EGP`, change: "Completed payments", icon: DollarSign, color: "bg-gold" },
      ]
    : [];

  const modelData = (aiUsage?.perModel || []).reduce<Record<string, number>>((acc, m) => {
    const key = m.model || "unknown";
    acc[key] = (acc[key] ?? 0) + m.calls;
    return acc;
  }, {});
  const personaData = Object.entries(modelData).map(([name, value]) => ({ name, value }));

  const totalCost = aiUsage?.summary.cost ?? 0;
  const totalCalls = aiUsage?.summary.totalCalls ?? 0;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex items-center gap-2 mb-8">
        <BarChart3 className="w-6 h-6 text-gold" />
        <h1 className="text-2xl font-serif font-bold text-nile dark:text-sand">
          {t("title")}
        </h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-gold" />
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-red-600 dark:text-red-300 text-sm">
          Failed to load dashboard data. {error}
        </div>
      ) : (
        <div className="space-y-6">
          <StatsCards stats={statCards} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-nile rounded-2xl border border-sand/50 dark:border-nile-light/20 p-6">
              <h2 className="text-lg font-serif font-bold text-nile dark:text-sand mb-6">
                Monthly Activity
              </h2>
              <div className="h-72">
                {monthly.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                    No activity yet
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthly}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                      <YAxis stroke="#9ca3af" fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="users" fill="#0F4C5C" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="chats" fill="#C9954A" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-nile rounded-2xl border border-sand/50 dark:border-nile-light/20 p-6">
              <h2 className="text-lg font-serif font-bold text-nile dark:text-sand mb-4">
                AI Calls by Model
              </h2>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Cpu className="w-4 h-4 text-gold" />
                  <span className="font-medium text-nile dark:text-sand">{totalCalls.toLocaleString()}</span>
                  calls
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium text-nile dark:text-sand">${totalCost.toFixed(4)}</span> cost
                </div>
              </div>
              <div className="h-56">
                {personaData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                    No AI usage yet
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={personaData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {personaData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
