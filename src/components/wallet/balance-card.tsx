"use client";

import { useTranslations } from "next-intl";
import { Wallet, TrendingUp } from "lucide-react";

interface BalanceCardProps {
  balance: number;
  lifetimeTokens: number;
}

export function BalanceCard({ balance, lifetimeTokens }: BalanceCardProps) {
  const t = useTranslations("wallet");

  return (
    <div className="bg-gradient-to-br from-gold to-gold-dark rounded-2xl p-6 md:p-8 text-white">
      <div className="flex items-center gap-2 text-white/80 mb-6">
        <Wallet className="w-5 h-5" />
        <span className="text-sm font-medium">{t("balance")}</span>
      </div>

      <div className="text-4xl md:text-5xl font-bold mb-2">
        {balance.toLocaleString()}
      </div>
      <div className="text-white/60 text-sm mb-6">{t("tokens")}</div>

      <div className="flex items-center gap-2 text-white/80 text-sm">
        <TrendingUp className="w-4 h-4" />
        <span>
          {lifetimeTokens.toLocaleString()} {t("tokens")} {t("transactions").toLowerCase()}
        </span>
      </div>
    </div>
  );
}
