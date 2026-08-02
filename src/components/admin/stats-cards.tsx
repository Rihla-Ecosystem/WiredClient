"use client";

import { Users, MessageSquare, DollarSign, Activity } from "lucide-react";

interface Stat {
  label: string;
  value: string;
  change: string;
  icon: React.ElementType;
  color: string;
}

interface StatsCardsProps {
  stats: Stat[];
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-white dark:bg-nile rounded-xl border border-sand/50 dark:border-nile-light/20 p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.color}`}
              >
                <Icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-nile dark:text-sand">
              {stat.value}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{stat.change}</div>
          </div>
        );
      })}
    </div>
  );
}
