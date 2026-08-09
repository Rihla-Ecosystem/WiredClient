"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Loader2, Settings as SettingsIcon, User } from "lucide-react";
import { AuthGuard } from "@/components/layout/auth-guard";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useAuthStore } from "@/lib/stores/auth-store";

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      style={{
        width: 44,
        height: 24,
        borderRadius: 99,
        background: on ? "var(--color-faience, #2E9C93)" : "var(--border)",
        border: "none",
        cursor: "pointer",
        position: "relative",
        transition: "background 0.22s",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "#fff",
          position: "absolute",
          top: 3,
          left: on ? 23 : 3,
          transition: "left 0.22s",
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
        }}
      />
    </button>
  );
}

function Row({ label, sub, right, border = true }: { label: string; sub?: string; right: React.ReactNode; border?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "14px 0",
        borderBottom: border ? "1px solid var(--border)" : "none",
        gap: 16,
      }}
    >
      <div>
        <div style={{ fontFamily: "'Cairo',sans-serif", fontSize: "14px", fontWeight: 600, color: "var(--fg-body)" }}>{label}</div>
        {sub && (
          <div style={{ fontFamily: "'Cairo',sans-serif", fontSize: "12px", color: "var(--muted)", marginTop: 2 }}>{sub}</div>
        )}
      </div>
      <div style={{ flexShrink: 0 }}>{right}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "var(--surface)",
        borderRadius: 16,
        padding: "6px 22px",
        border: "1px solid var(--border)",
        marginBottom: 16,
      }}
    >
      <div
        style={{
          fontFamily: "'Cairo',sans-serif",
          fontSize: "10px",
          fontWeight: 700,
          color: "var(--muted)",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          padding: "14px 0 8px",
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

const PERSONAS = [
  { id: "guide", key: "guide", icon: "🧭" },
  { id: "historian", key: "historian", icon: "📜" },
  { id: "local", key: "local", icon: "🫖" },
];

export default function SettingsPage() {
  const t = useTranslations("settings");
  const { logout } = useAuthStore();
  const [alerts, setAlerts] = useState(true);
  const [updates, setUpdates] = useState(true);
  const [rafiq, setRafiq] = useState("guide");
  const [units, setUnits] = useState<"metric" | "imperial">("metric");
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const flash = (key: string) => {
    setSaving(key);
    setTimeout(() => {
      setSaving(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    }, 500);
  };

  return (
    <AuthGuard>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <SettingsIcon className="w-6 h-6 text-faience" />
          <div>
            <h1 className="font-heading text-2xl font-semibold">{t("title")}</h1>
            <p className="text-sm text-muted">{t("subtitle")}</p>
          </div>
        </div>

        {/* Appearance */}
        <Section title={t("appearance")}>
          <Row label={t("language")} sub={t("languageSub")} right={<LanguageSwitcher />} />
          <Row label={t("theme")} sub={t("themeSub")} border={false} right={<ThemeToggle />} />
        </Section>

        {/* Notifications */}
        <Section title={t("notifications")}>
          <Row label={t("alerts")} sub={t("alertsSub")} right={<Toggle on={alerts} onChange={() => setAlerts((v) => !v)} />} />
          <Row label={t("updates")} sub={t("updatesSub")} border={false} right={<Toggle on={updates} onChange={() => setUpdates((v) => !v)} />} />
        </Section>

        {/* Rafiq */}
        <Section title={t("rafiq")}>
          <div className="grid grid-cols-1 gap-2 py-2">
            {PERSONAS.map((p) => {
              const active = rafiq === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setRafiq(p.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: active ? "1.5px solid var(--color-faience)" : "1px solid var(--border)",
                    background: active ? "color-mix(in srgb, var(--color-faience) 8%, transparent)" : "transparent",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <span style={{ fontSize: 20 }}>{p.icon}</span>
                  <span style={{ fontFamily: "'Cairo',sans-serif", fontSize: "14px", fontWeight: 600 }}>{t(p.key)}</span>
                </button>
              );
            })}
          </div>
          <Row label={t("units")} sub={t("unitsSub")} border={false} right={
            <button
              onClick={() => { setUnits(units === "metric" ? "imperial" : "metric"); flash("units"); }}
              style={{ fontFamily: "'Cairo',sans-serif", fontSize: "13px", fontWeight: 600, color: "var(--color-faience)", background: "none", border: "none", cursor: "pointer" }}
            >
              {units === "metric" ? t("metric") : t("imperial")}
            </button>
          } />
        </Section>

        {/* Account */}
        <Section title={t("account")}>
          <Row label={t("editProfile")} sub={t("accountSub")} right={
            <Link href="/profile" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold border border-faience/40 text-faience hover:bg-faience/10 transition-colors">
              <User className="w-4 h-4" /> {t("editProfile")} →
            </Link>
          } />
          <Row label={t("privacy")} sub={t("privacySub")} right={
            <button
              onClick={() => flash("export")}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold border border-primary-400/40 text-primary-600 dark:text-primary-400 hover:bg-primary-400/10 transition-colors"
            >
              {saving === "export" ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {saving === "export" ? t("exporting") : t("exportData")}
            </button>
          } border={false} />
        </Section>

        {saved && (
          <div className="px-4 py-2 rounded-lg bg-safe/10 text-safe text-sm mb-4">{t("saved")}</div>
        )}

        <button
          onClick={() => logout()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 18px",
            borderRadius: 12,
            border: "1px solid color-mix(in srgb, var(--color-red) 40%, transparent)",
            background: "color-mix(in srgb, var(--color-red) 10%, transparent)",
            color: "var(--color-red)",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "'Cairo',sans-serif",
            fontSize: "14px",
          }}
        >
          <User className="w-4 h-4" /> {t("signOut")}
        </button>
      </div>
    </AuthGuard>
  );
}