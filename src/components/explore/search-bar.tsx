"use client";

import { MapPin, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  governorate?: string;
  onGovernorateChange?: (gov: string) => void;
  governorates?: string[];
  category?: string;
  onCategoryChange?: (cat: string) => void;
}

const CATEGORY_CHIPS = [
  { value: "archaeological", labelKey: "archaeological" },
  { value: "islamic", labelKey: "islamic" },
  { value: "christian", labelKey: "christian" },
  { value: "infrastructure", labelKey: "infrastructure" },
];

export function SearchBar({
  value,
  onChange,
  governorate,
  onGovernorateChange,
  governorates = [],
  category,
  onCategoryChange,
}: SearchBarProps) {
  const t = useTranslations("explore");

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="w-full pl-10 pr-8 py-2.5 rounded-lg border border-sand/60 dark:border-nile-light/40 bg-white dark:bg-nile-light text-nile dark:text-sand placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-nile dark:hover:text-sand"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {onGovernorateChange && (
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <select
            value={governorate}
            onChange={(e) => onGovernorateChange(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 rounded-lg border border-sand/60 dark:border-nile-light/40 bg-white dark:bg-nile-light text-nile dark:text-sand text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all appearance-none cursor-pointer"
          >
            <option value="">{t("allGovernorates")}</option>
            {governorates.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      )}

      {onCategoryChange && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onCategoryChange("")}
            className={`text-xs px-3 py-1 rounded-full border transition-all ${
              !category
                ? "bg-gold text-white border-gold"
                : "border-sand/60 dark:border-nile-light/40 text-muted-foreground hover:border-gold/50"
            }`}
          >
            {t("allCategories")}
          </button>
          {CATEGORY_CHIPS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => onCategoryChange(c.value)}
              className={`text-xs px-3 py-1 rounded-full border transition-all ${
                category === c.value
                  ? "bg-gold text-white border-gold"
                  : "border-sand/60 dark:border-nile-light/40 text-muted-foreground hover:border-gold/50"
              }`}
            >
              {t(c.labelKey)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
