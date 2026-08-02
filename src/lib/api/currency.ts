import { coreClient } from "./client";

export interface ExchangeRates {
  base: string;
  rates: Record<string, number> | null;
  retrievedAt: string | null;
  source: string | null;
  nextUpdateAt: string | null;
  available: boolean;
  stale?: boolean;
}

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  minorUnit: string;
  denominations: { value: number; unit: string; type: string }[];
  supportedCurrencies: string[];
}

export interface CurrencyMeta {
  name: string;
  iso_code: string;
  symbol: string;
  issuing_authority: string;
}

export interface CoinItem {
  id: string;
  denomination: string;
  value_in_egp: number;
  type: string;
  material: string;
  obverse_design: string;
  reverse_design: string;
  image_url_front: string;
  image_url_back: string;
}

export interface BanknoteItem {
  id: string;
  denomination: string;
  value_in_egp: number;
  substrate: string;
  dimensions_mm: string;
  obverse_design: string;
  reverse_design: string;
  image_url_front: string;
  image_url_back: string;
}

export interface EgyptianCurrency {
  currency: CurrencyMeta;
  coins: CoinItem[];
  banknotes: BanknoteItem[];
}

export const currencyApi = {
  getRates: async (base = "EGP"): Promise<ExchangeRates> => {
    const { data } = await coreClient.get<ExchangeRates>("/currency/rates", {
      params: { base },
    });
    return data;
  },
  getInfo: async (): Promise<CurrencyInfo> => {
    const { data } = await coreClient.get<CurrencyInfo>("/currency/info");
    return data;
  },
  getCatalog: async (): Promise<EgyptianCurrency | null> => {
    try {
      const response = await fetch("/CurrunciesEG.json");
      if (!response.ok) return null;
      return (await response.json()) as EgyptianCurrency;
    } catch {
      return null;
    }
  },
};
