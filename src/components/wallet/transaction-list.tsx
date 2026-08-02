"use client";

import { useTranslations } from "next-intl";
import { ArrowUpRight, ArrowDownLeft, Receipt } from "lucide-react";

interface Transaction {
  id: string;
  type: "purchase" | "spend" | "reward";
  amount: number;
  description: string;
  timestamp: string;
}

interface TransactionListProps {
  transactions: Transaction[];
}

const TYPE_CONFIG = {
  purchase: { icon: ArrowDownLeft, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20" },
  spend: { icon: ArrowUpRight, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20" },
  reward: { icon: ArrowDownLeft, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
};

export function TransactionList({ transactions }: TransactionListProps) {
  const t = useTranslations("wallet");

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <Receipt className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
        <p className="text-sm text-muted-foreground">{t("noTransactions")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((tx) => {
        const cfg = TYPE_CONFIG[tx.type];
        const Icon = cfg.icon;
        const sign = tx.type === "spend" ? "-" : "+";
        return (
          <div
            key={tx.id}
            className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-nile border border-sand/50 dark:border-nile-light/20"
          >
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${cfg.bg}`}
            >
              <Icon className={`w-4 h-4 ${cfg.color}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-nile dark:text-sand">
                {tx.description}
              </p>
              <p className="text-xs text-muted-foreground">{tx.timestamp}</p>
            </div>
            <span className={`text-sm font-semibold ${cfg.color}`}>
              {sign}{tx.amount}
            </span>
          </div>
        );
      })}
    </div>
  );
}
