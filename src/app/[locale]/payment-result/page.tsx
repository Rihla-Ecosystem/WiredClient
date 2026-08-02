"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { CheckCircle2, XCircle, Clock, Wallet, Loader2 } from "lucide-react";

import { AuthGuard } from "@/components/layout/auth-guard";
import { walletApi } from "@/lib/api/wallet";

export default function PaymentResultPage() {
  const t = useTranslations("wallet");
  const locale = useLocale();
  const router = useRouter();

  const [balance, setBalance] = useState<number | null>(null);
  const [status, setStatus] = useState<"success" | "pending" | "failed" | "unknown">(
    "unknown"
  );

  const refreshBalance = useCallback(async () => {
    try {
      const res = await walletApi.getBalance();
      setBalance(res.balance);
    } catch {
      setBalance(0);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get("success");
    const pending = params.get("pending");
    const error = params.get("error");

    if (error) {
      setStatus("failed");
    } else if (pending && pending !== "false") {
      setStatus("pending");
    } else if (success === "true") {
      setStatus("success");
    } else if (success === "false") {
      setStatus("failed");
    } else {
      setStatus("unknown");
    }

    refreshBalance();
  }, [refreshBalance]);

  const icon =
    status === "success" ? (
      <CheckCircle2 className="w-14 h-14 text-green-500" />
    ) : status === "pending" ? (
      <Clock className="w-14 h-14 text-gold" />
    ) : status === "failed" ? (
      <XCircle className="w-14 h-14 text-red-500" />
    ) : (
      <Wallet className="w-14 h-14 text-muted-foreground" />
    );

  const message =
    status === "success"
      ? t("paymentComplete")
      : status === "pending"
        ? t("paymentPending")
        : status === "failed"
          ? t("paymentFailed")
          : t("choosePackage");

  return (
    <AuthGuard>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-nile rounded-2xl border border-sand/50 dark:border-nile-light/20 p-8 text-center">
          <div className="flex justify-center mb-4">{icon}</div>
          <h1 className="text-xl font-serif font-bold text-nile dark:text-sand mb-2">
            {status === "success" ? t("success") : t("title")}
          </h1>
          <p className="text-sm text-muted-foreground mb-6">{message}</p>

          <div className="flex items-center justify-center gap-2 mb-6 py-3 rounded-xl bg-sand/20 dark:bg-nile-light/10">
            <Wallet className="w-4 h-4 text-gold" />
            <span className="text-sm text-muted-foreground">{t("balance")}:</span>
            <span className="font-semibold text-nile dark:text-sand">
              {balance === null ? (
                <Loader2 className="w-4 h-4 animate-spin inline text-gold" />
              ) : (
                balance.toLocaleString()
              )}
            </span>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              type="button"
              onClick={refreshBalance}
              className="px-4 py-2.5 rounded-lg border border-sand/60 dark:border-nile-light/30 text-sm text-nile dark:text-sand hover:bg-sand/30 dark:hover:bg-nile-light/20 transition-colors"
            >
              {t("refreshBalance")}
            </button>
            <button
              type="button"
              onClick={() => router.push(`/${locale}/wallet`)}
              className="px-4 py-2.5 rounded-lg bg-gold hover:bg-gold-dark text-white text-sm font-medium transition-colors"
            >
              {t("backToWallet")}
            </button>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
