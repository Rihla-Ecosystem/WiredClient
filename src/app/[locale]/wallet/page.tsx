"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Wallet, Loader2 } from "lucide-react";

import { AuthGuard } from "@/components/layout/auth-guard";
import { BalanceCard } from "@/components/wallet/balance-card";
import { TransactionList } from "@/components/wallet/transaction-list";
import { PackageGrid } from "@/components/wallet/package-grid";
import { walletApi, type WalletTransaction } from "@/lib/api/wallet";

export default function WalletPage() {
  const t = useTranslations("wallet");
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [bal, txs] = await Promise.all([
          walletApi.getBalance(),
          walletApi.getTransactions(),
        ]);
        if (cancelled) return;
        setBalance(bal.balance);
        setTransactions(txs);
      } catch {
        // show zeros if backend unavailable
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AuthGuard>
      <div className="min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
        <h1 className="text-2xl font-serif font-bold text-nile dark:text-sand flex items-center gap-2 mb-8">
          <Wallet className="w-6 h-6 text-gold" />
          {t("title")}
        </h1>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 animate-spin text-gold" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <BalanceCard balance={balance} lifetimeTokens={balance} />
              </div>
              <div className="bg-white dark:bg-nile rounded-2xl border border-sand/50 dark:border-nile-light/20 p-6">
                <h2 className="text-lg font-serif font-bold text-nile dark:text-sand mb-4">
                  {t("transactions")}
                </h2>
                <TransactionList transactions={transactions} />
              </div>
            </div>

            <div className="bg-white dark:bg-nile rounded-2xl border border-sand/50 dark:border-nile-light/20 p-6">
              <h2 className="text-lg font-serif font-bold text-nile dark:text-sand mb-6">
                {t("packages")}
              </h2>
              <PackageGrid />
            </div>
          </>
        )}
      </div>
    </AuthGuard>
  );
}
