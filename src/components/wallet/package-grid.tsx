"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

import { walletApi, type TokenPackage } from "@/lib/api/wallet";

export function PackageGrid() {
  const t = useTranslations("wallet");
  const [packages, setPackages] = useState<TokenPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    walletApi
      .getPackages()
      .then(setPackages)
      .catch(() => setError(t("error")))
      .finally(() => setLoading(false));
  }, [t]);

  const handlePurchase = async (pkg: TokenPackage) => {
    setProcessing(pkg.id);
    setError(null);
    setSuccess(null);

    try {
      const result = await walletApi.purchasePackage(pkg.id);
      if (result.success && result.checkoutUrl) {
        setSuccess(pkg.id);
        window.location.href = result.checkoutUrl;
      } else if (result.success && !result.checkoutUrl) {
        setError(t("error"));
      } else {
        setError(t("error"));
      }
    } catch (e) {
      const err = e as { response?: { data?: { error?: string } } };
      setError(err?.response?.data?.error || t("error"));
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
          <XCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {t("success")}
        </div>
      )}

      {packages.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          {t("noData")}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative p-6 rounded-2xl border transition-all ${
                pkg.popular
                  ? "border-gold bg-gold/5 dark:bg-gold/10 shadow-lg"
                  : "border-sand/50 dark:border-nile-light/20 bg-white dark:bg-nile"
              }`}
            >
              {pkg.popular && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gold text-white text-xs font-medium rounded-full">
                  {t("popular")}
                </span>
              )}

              <h3 className="text-lg font-serif font-bold text-nile dark:text-sand">
                {pkg.name}
              </h3>
              <div className="text-3xl font-bold text-gold my-3">
                {pkg.tokens.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground mb-1">
                {t("tokens")}
              </div>
              <div className="text-lg font-semibold text-nile dark:text-sand mb-5">
                {pkg.price.toFixed(2)} EGP
              </div>

              <button
                type="button"
                onClick={() => handlePurchase(pkg)}
                disabled={processing === pkg.id}
                className="w-full py-2.5 rounded-lg bg-gold hover:bg-gold-dark text-white font-medium text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processing === pkg.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("processing")}
                  </>
                ) : (
                  t("buy")
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
