"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { Coins, Loader2, ArrowLeft, XCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

import { AuthGuard } from "@/components/layout/auth-guard";
import { walletApi, type TokenPackage } from "@/lib/api/wallet";

export default function WalletPurchasePage() {
  const t = useTranslations("wallet");
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [pkg, setPkg] = useState<TokenPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    walletApi
      .getPackages()
      .then((packages) => {
        if (cancelled) return;
        const found = packages.find((p) => p.id === id);
        if (found) setPkg(found);
        else setNotFound(true);
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handlePurchase = async () => {
    if (!pkg) return;
    setProcessing(true);
    setError(null);
    try {
      const result = await walletApi.purchasePackage(pkg.id);
      if (result.success && result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        setError(t("error"));
      }
    } catch (e) {
      const err = e as { response?: { data?: { error?: string } } };
      setError(err?.response?.data?.error || t("error"));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8 max-w-xl mx-auto">
        <Link
          href="/wallet"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-nile dark:hover:text-sand transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("backToWallet")}
        </Link>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 animate-spin text-gold" />
          </div>
        ) : notFound || !pkg ? (
          <div className="text-center py-16">
            <XCircle className="w-14 h-14 text-red-500 mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">{t("noData")}</p>
            <button
              type="button"
              onClick={() => router.push("/wallet")}
              className="mt-6 px-5 py-2.5 bg-gold hover:bg-gold-dark text-white rounded-lg font-medium text-sm transition-colors"
            >
              {t("backToWallet")}
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-nile rounded-2xl border border-sand/50 dark:border-nile-light/20 p-8 text-center">
            {pkg.popular && (
              <span className="inline-block px-3 py-0.5 bg-gold text-white text-xs font-medium rounded-full mb-4">
                {t("popular")}
              </span>
            )}
            <h1 className="text-xl font-serif font-bold text-nile dark:text-sand">
              {t("packageDetail")}
            </h1>
            <h2 className="text-lg font-serif font-bold text-nile dark:text-sand mt-1">
              {pkg.name}
            </h2>

            <div className="my-8 flex items-center justify-center gap-3">
              <Coins className="w-8 h-8 text-gold" />
              <span className="text-5xl font-bold text-gold">
                {pkg.tokens.toLocaleString()}
              </span>
              <span className="text-muted-foreground text-sm">{t("tokensIncluded")}</span>
            </div>

            <div className="pb-6">
              <div className="text-muted-foreground text-sm mb-1">{t("price")}</div>
              <div className="text-2xl font-semibold text-nile dark:text-sand">
                {pkg.price.toFixed(2)} EGP
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400 flex items-center justify-center gap-2">
                <XCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handlePurchase}
              disabled={processing}
              className="w-full py-3 rounded-lg bg-gold hover:bg-gold-dark text-white font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("processing")}
                </>
              ) : (
                t("confirmPurchase")
              )}
            </button>

            <p className="text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {t("redirecting")}
            </p>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}