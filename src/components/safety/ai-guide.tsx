"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import { MarkdownContent } from "@/components/chat/markdown-content";
import { chatApi } from "@/lib/api/chat";
import { useAuthStore } from "@/lib/stores/auth-store";
import type { CityRisk } from "@/lib/api/safety";

interface AiGuideProps {
  city: string;
  risk: CityRisk;
  coords?: { latitude: number; longitude: number };
}

const SEVERITY_RANK: Record<string, number> = {
  critical: 0,
  warning: 1,
  advisory: 2,
  info: 3,
};

function normalizeSeverity(severity?: string): "advisory" | "warning" | "critical" | "info" {
  switch ((severity || "info").toLowerCase()) {
    case "critical":
    case "high":
      return "critical";
    case "warning":
      return "warning";
    case "advisory":
      return "advisory";
    default:
      return "info";
  }
}

function buildPrompt(city: string, risk: CityRisk, nationality: string | null) {
  const topEvents = [...risk.events]
    .map((e) => ({
      type: e.type ?? normalizeSeverity(e.severity),
      title: e.title ?? e.headline ?? "",
      description: e.description ?? e.category ?? e.headline ?? "",
    }))
    .sort(
      (a, b) =>
        (SEVERITY_RANK[a.type] ?? 4) - (SEVERITY_RANK[b.type] ?? 4)
    )
    .slice(0, 5);
  const eventLines = topEvents
    .map((e) => `- [${e.type}] ${e.title}: ${e.description.slice(0, 140)}`)
    .join("\n");

  return [
    "You are a travel safety expert for visitors to Egypt.",
    `A traveler from ${nationality || "a foreign country"} is visiting ${city}, Egypt.`,
    `Current official risk level for ${city}: ${risk.level} (score ${risk.score}).`,
    "Recent official alerts:",
    eventLines || "- No active alerts.",
    "Give a concise markdown briefing (under 220 words) using exactly these section headers:",
    "## Key Risks",
    "## Local Safety Tips",
    `## Advice for ${nationality || "International"} Travelers`,
    "Use short bullet points only. Be practical, calm, and specific to the alerts above.",
  ].join("\n");
}

export function AiGuide({ city, risk, coords }: AiGuideProps) {
  const t = useTranslations("safety");
  const nationality = useAuthStore((s) => s.user?.nationality ?? null);
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markdown, setMarkdown] = useState("");
  const [genKey, setGenKey] = useState(0);

  useEffect(() => {
    if (!risk || risk.city !== city) return;
    let cancelled = false;
    (async () => {
      try {
        const prompt = buildPrompt(city, risk, nationality);
        await chatApi.streamMessage(
          prompt,
          "safety_guru",
          (token) => {
            if (!cancelled) setMarkdown((m) => m + token);
          },
          { lat: coords?.latitude, lon: coords?.longitude }
        );
      } catch {
        if (!cancelled) setError(t("aiGuideError"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [city, risk, nationality, genKey, coords, t]);

  const regenerate = () => {
    setMarkdown("");
    setError(null);
    setLoading(true);
    setGenKey((k) => k + 1);
  };

  const label = nationality || t("aiGuideIntl");

  return (
    <div className="rounded-xl border border-sand/50 dark:border-nile-light/20 bg-white dark:bg-nile overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-sand/50 dark:border-nile-light/20">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2.5 min-w-0 text-left flex-1"
          aria-expanded={open}
        >
          <div className="w-8 h-8 rounded-lg bg-gold/10 text-gold flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-nile dark:text-sand">
                {t("aiGuideTitle")}
              </h3>
              {loading && (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-gold" />
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {t("aiGuideFor")} {label}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={regenerate}
            disabled={loading}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-gold hover:bg-gold/10 transition-colors disabled:opacity-40"
            aria-label={t("aiGuideRegenerate")}
            title={t("aiGuideRegenerate")}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-nile dark:hover:text-sand hover:bg-sand/30 dark:hover:bg-nile-light/20 transition-colors"
            aria-label={open ? t("aiGuideCollapse") : t("aiGuideExpand")}
          >
            {open ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {open && (
        <div className="px-4 py-3">
          {error ? (
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-red-500 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {error}
              </p>
              <button
                type="button"
                onClick={regenerate}
                className="text-xs font-medium text-gold hover:underline flex-shrink-0"
              >
                {t("aiGuideRetry")}
              </button>
            </div>
          ) : loading && !markdown ? (
            <p className="text-xs text-muted-foreground">{t("aiGuideLoading")}</p>
          ) : (
            <div className="max-h-64 lg:max-h-72 overflow-y-auto pr-1 text-sm text-nile dark:text-sand">
              <MarkdownContent content={markdown} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
