"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Banknote, Coins, Loader2, RefreshCw, TrendingUp } from "lucide-react";

import { AuthGuard } from "@/components/layout/auth-guard";
import { EmptyState } from "@/components/shared/empty-state";
import {
  currencyApi,
  type BanknoteItem,
  type CoinItem,
  type EgyptianCurrency,
  type ExchangeRates,
} from "@/lib/api/currency";

const TARGET_CURRENCIES = ["USD", "EUR", "GBP", "SAR", "AED"] as const;

function formatRate(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(value);
}

function formatMoney(value: number, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDateTime(value: string | null, locale: string): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function CoinCard({ coin, t, locale }: { coin: CoinItem; t: (key: string) => string; locale: string }) {
  return (
    <div className="rounded-xl border border-sand/50 dark:border-nile-light/20 bg-white dark:bg-nile-light/10 p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold text-nile dark:text-sand text-sm">
          {coin.denomination}
        </h3>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/20 whitespace-nowrap">
          {formatMoney(coin.value_in_egp, "EGP", locale)}
        </span>
      </div>
      <div className="flex gap-2">
        {coin.image_url_front && (
          <Image
            src={coin.image_url_front}
            alt={`${coin.denomination} front`}
            width={180}
            height={90}
            unoptimized
            className="rounded-lg object-contain bg-sand/20 dark:bg-nile-light/20 h-[90px] w-[180px]"
          />
        )}
        {coin.image_url_back && (
          <Image
            src={coin.image_url_back}
            alt={`${coin.denomination} back`}
            width={180}
            height={90}
            unoptimized
            className="rounded-lg object-contain bg-sand/20 dark:bg-nile-light/20 h-[90px] w-[180px]"
          />
        )}
      </div>
      <dl className="space-y-1 text-xs text-muted-foreground">
        <div className="flex justify-between gap-2">
          <dt className="font-medium">{t("material")}</dt>
          <dd className="text-right">{coin.material}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="font-medium">{t("obverse")}</dt>
          <dd className="text-right max-w-[60%]">{coin.obverse_design}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="font-medium">{t("reverse")}</dt>
          <dd className="text-right max-w-[60%]">{coin.reverse_design}</dd>
        </div>
      </dl>
    </div>
  );
}

function BanknoteCard({ note, t, locale }: { note: BanknoteItem; t: (key: string) => string; locale: string }) {
  return (
    <div className="rounded-xl border border-sand/50 dark:border-nile-light/20 bg-white dark:bg-nile-light/10 p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold text-nile dark:text-sand text-sm">
          {note.denomination}
        </h3>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/20 whitespace-nowrap">
          {formatMoney(note.value_in_egp, "EGP", locale)}
        </span>
      </div>
      <div className="flex gap-2">
        {note.image_url_front && (
          <Image
            src={note.image_url_front}
            alt={`${note.denomination} front`}
            width={220}
            height={100}
            unoptimized
            className="rounded-lg object-contain bg-sand/20 dark:bg-nile-light/20 h-[100px] w-[220px]"
          />
        )}
        {note.image_url_back && (
          <Image
            src={note.image_url_back}
            alt={`${note.denomination} back`}
            width={220}
            height={100}
            unoptimized
            className="rounded-lg object-contain bg-sand/20 dark:bg-nile-light/20 h-[100px] w-[220px]"
          />
        )}
      </div>
      <dl className="space-y-1 text-xs text-muted-foreground">
        <div className="flex justify-between gap-2">
          <dt className="font-medium">{t("substrate")}</dt>
          <dd className="text-right">{note.substrate}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="font-medium">{t("dimensions")}</dt>
          <dd className="text-right">{note.dimensions_mm}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="font-medium">{t("obverse")}</dt>
          <dd className="text-right max-w-[60%]">{note.obverse_design}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="font-medium">{t("reverse")}</dt>
          <dd className="text-right max-w-[60%]">{note.reverse_design}</dd>
        </div>
      </dl>
    </div>
  );
}

export default function CurrencyPage() {
  const t = useTranslations("currency");
  const locale = useLocale();
  const [catalog, setCatalog] = useState<EgyptianCurrency | null>(null);
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [ratesLoading, setRatesLoading] = useState(true);
  const [amount, setAmount] = useState("100");

  useEffect(() => {
    currencyApi.getCatalog().then(setCatalog);
  }, []);

  useEffect(() => {
    let active = true;
    currencyApi
      .getRates("EGP")
      .then((data) => {
        if (active) setRates(data);
      })
      .catch(() => {
        if (active) setRates(null);
      })
      .finally(() => {
        if (active) setRatesLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const parsedAmount = useMemo(() => {
    const value = Number.parseFloat(amount);
    return Number.isFinite(value) && value >= 0 ? value : 0;
  }, [amount]);

  const ratesTable = useMemo(() => {
    if (!rates?.rates) return [];
    return TARGET_CURRENCIES.map((code) => ({
      code,
      perOneEgp: rates.rates![code],
    })).filter((row) => typeof row.perOneEgp === "number");
  }, [rates]);

  return (
    <AuthGuard>
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <header>
          <h1 className="text-2xl font-serif font-bold text-nile dark:text-sand flex items-center gap-2">
            <Coins className="w-6 h-6 text-gold" />
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
        </header>

        {!catalog ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-gold" />
            <span className="ml-2 text-sm text-muted-foreground">
              {t("loading")}
            </span>
          </div>
        ) : (
          <>
            <section className="rounded-xl border border-sand/50 dark:border-nile-light/20 bg-white dark:bg-nile-light/10 p-5">
              <h2 className="text-sm font-semibold text-nile dark:text-sand mb-3">
                {catalog.currency.name}
              </h2>
              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">
                    {t("isoCode")}
                  </dt>
                  <dd className="font-medium text-nile dark:text-sand">
                    {catalog.currency.iso_code}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">{t("symbol")}</dt>
                  <dd className="font-medium text-nile dark:text-sand font-arabic">
                    {catalog.currency.symbol}
                  </dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-xs text-muted-foreground">{t("authority")}</dt>
                  <dd className="font-medium text-nile dark:text-sand">
                    {catalog.currency.issuing_authority}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-xl border border-sand/50 dark:border-nile-light/20 bg-white dark:bg-nile-light/10 p-5">
              <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
                <h2 className="text-sm font-semibold text-nile dark:text-sand flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-gold" />
                  {t("liveRates")}
                </h2>
                {ratesLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-gold" />
                ) : rates && !rates.available && rates.stale ? (
                  <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" />
                    {t("cached")}
                  </span>
                ) : null}
              </div>

              {ratesLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {TARGET_CURRENCIES.map((code) => (
                    <div
                      key={code}
                      className="rounded-lg bg-sand/30 dark:bg-nile-light/20 p-3 animate-pulse"
                    >
                      <div className="h-3 w-10 bg-sand/60 dark:bg-nile-light/30 rounded mb-2" />
                      <div className="h-5 w-16 bg-sand/60 dark:bg-nile-light/30 rounded" />
                    </div>
                  ))}
                </div>
              ) : !rates?.rates ? (
                <p className="text-sm text-red-500">{t("unavailable")}</p>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {ratesTable.map((row) => (
                      <div
                        key={row.code}
                        className="rounded-lg bg-sand/30 dark:bg-nile-light/20 p-3"
                      >
                        <div className="text-xs font-semibold text-nile dark:text-sand">
                          {row.code}
                        </div>
                        <div className="text-lg font-bold text-nile dark:text-sand">
                          {formatRate(row.perOneEgp, locale)}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {t("baseCurrency")}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[11px] text-muted-foreground">
                    <span>
                      {t("lastUpdated")}: {formatDateTime(rates.retrievedAt, locale)}
                    </span>
                    <span>
                      {t("nextUpdate")}: {formatDateTime(rates.nextUpdateAt, locale)}
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-5 pt-5 border-t border-sand/50 dark:border-nile-light/20">
                <h3 className="text-sm font-semibold text-nile dark:text-sand mb-3">
                  {t("converterTitle")}
                </h3>
                <label className="block text-xs text-muted-foreground mb-1">
                  {t("amount")}
                </label>
                <input
                  type="number"
                  min="0"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  className="w-full sm:w-64 rounded-lg border border-sand/60 dark:border-nile-light/30 bg-white dark:bg-nile px-3 py-2 text-sm text-nile dark:text-sand focus:outline-none focus:ring-2 focus:ring-gold/40"
                />
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {ratesTable.map((row) => (
                    <div
                      key={row.code}
                      className="flex items-center justify-between rounded-lg bg-sand/30 dark:bg-nile-light/20 px-3 py-2 text-sm"
                    >
                      <span className="font-medium text-nile dark:text-sand">
                        {row.code}
                      </span>
                      <span className="text-muted-foreground">
                        {formatMoney(parsedAmount * row.perOneEgp, row.code, locale)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-serif font-semibold text-nile dark:text-sand flex items-center gap-2 mb-4">
                <Coins className="w-5 h-5 text-gold" />
                {t("coins")}
              </h2>
              {catalog.coins.length === 0 ? (
                <EmptyState icon="Coins" title={t("coins")} description="" />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {catalog.coins.map((coin) => (
                    <CoinCard key={coin.id} coin={coin} t={t} locale={locale} />
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="text-lg font-serif font-semibold text-nile dark:text-sand flex items-center gap-2 mb-4">
                <Banknote className="w-5 h-5 text-gold" />
                {t("banknotes")}
              </h2>
              {catalog.banknotes.length === 0 ? (
                <EmptyState icon="Banknote" title={t("banknotes")} description="" />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {catalog.banknotes.map((note) => (
                    <BanknoteCard key={note.id} note={note} t={t} locale={locale} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </AuthGuard>
  );
}
