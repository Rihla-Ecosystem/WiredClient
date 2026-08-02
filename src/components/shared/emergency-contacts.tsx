"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  ChevronDown,
  LifeBuoy,
  Loader2,
  Phone,
  PhoneCall,
  Siren,
  X,
} from "lucide-react";

interface EmergencyService {
  service: string;
  arabic_name?: string;
  number: string;
  notes?: string;
}

interface EmergencyProcedures {
  medical_emergencies?: { primary_numbers: string[]; steps: string[] };
  police_and_security?: { primary_numbers: string[]; steps: string[] };
  harassment_and_safety?: { primary_numbers: string[]; steps: string[] };
}

interface EmergencyContactsData {
  emergency_contacts: {
    unified_hotline: { number: string; description?: string };
    primary_services: EmergencyService[];
    specialized_hotlines: EmergencyService[];
  };
  procedures?: EmergencyProcedures;
}

export function EmergencyContacts() {
  const t = useTranslations("emergency");
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<EmergencyContactsData | null>(null);
  const [proceduresOpen, setProceduresOpen] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/Emergency_Contacts.json")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (active) setData(json);
      })
      .catch(() => {
        if (active) setData(null);
      });
    return () => {
      active = false;
    };
  }, []);

  const unified = data?.emergency_contacts.unified_hotline;
  const primary = data?.emergency_contacts.primary_services ?? [];
  const specialized = data?.emergency_contacts.specialized_hotlines ?? [];
  const procedures = data?.procedures;

  return (
    <>
      {/* Floating button — bottom-left so it never clashes with the bot (bottom-right) */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="fixed bottom-24 left-5 z-[1100] w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white transition-transform hover:scale-105 bg-gradient-to-br from-red-600 to-red-800 md:bottom-5"
        aria-label={t("open")}
      >
        {open ? <X className="w-6 h-6" /> : <Siren className="w-6 h-6" />}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-[12.5rem] left-5 z-[1100] w-[26rem] max-w-[calc(100vw-2.5rem)] h-[34rem] max-h-[calc(100vh-7rem)] flex flex-col rounded-2xl overflow-hidden border border-red-200/60 dark:border-red-900/40 bg-white dark:bg-nile shadow-2xl md:bottom-24">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-red-700 to-red-600 text-white flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <LifeBuoy className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm">{t("title")}</p>
              <p className="text-xs text-white/70 truncate">{t("subtitle")}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors"
              aria-label={t("close")}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4 bg-red-50/40 dark:bg-nile-dark">
            {!data ? (
              <div className="flex items-center justify-center py-16 gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                {t("loading")}
              </div>
            ) : (
              <>
                {/* Unified hotline */}
                {unified && (
                  <a
                    href={`tel:${unified.number}`}
                    className="block rounded-xl bg-gradient-to-br from-red-600 to-red-700 text-white p-4 shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                        <PhoneCall className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold">
                            {t("unifiedTitle")}
                          </span>
                          <span
                            dir="ltr"
                            className="text-xl font-bold tracking-wide"
                          >
                            {unified.number}
                          </span>
                        </div>
                        <p className="text-xs text-white/80">
                          {unified.description || t("unifiedNote")}
                        </p>
                      </div>
                    </div>
                  </a>
                )}

                {/* Primary services */}
                {primary.length > 0 && (
                  <section>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-red-700 dark:text-red-300 mb-2">
                      {t("primaryTitle")}
                    </h3>
                    <div className="space-y-2">
                      {primary.map((s) => (
                        <div
                          key={s.number}
                          className="rounded-xl border border-sand/50 dark:border-nile-light/20 bg-white dark:bg-nile p-3 flex items-start gap-3"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-semibold text-nile dark:text-sand">
                                {s.service}
                              </span>
                              {s.arabic_name && (
                                <span
                                  dir="rtl"
                                  className="text-xs text-muted-foreground font-arabic"
                                >
                                  {s.arabic_name}
                                </span>
                              )}
                            </div>
                            {s.notes && (
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                {s.notes}
                              </p>
                            )}
                          </div>
                          <a
                            href={`tel:${s.number}`}
                            className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span dir="ltr">{s.number}</span>
                          </a>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Specialized hotlines */}
                {specialized.length > 0 && (
                  <section>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-red-700 dark:text-red-300 mb-2">
                      {t("specializedTitle")}
                    </h3>
                    <div className="rounded-xl border border-sand/50 dark:border-nile-light/20 bg-white dark:bg-nile divide-y divide-sand/40 dark:divide-nile-light/20">
                      {specialized.map((s) => (
                        <a
                          key={s.number}
                          href={`tel:${s.number}`}
                          className="flex items-center justify-between gap-2 px-3 py-2.5 text-sm hover:bg-sand/30 dark:hover:bg-nile-light/20 transition-colors"
                        >
                          <span className="text-nile dark:text-sand min-w-0">
                            {s.service}
                          </span>
                          <span
                            dir="ltr"
                            className="font-semibold text-red-600 dark:text-red-400 flex-shrink-0"
                          >
                            {s.number}
                          </span>
                        </a>
                      ))}
                    </div>
                  </section>
                )}

                {/* Procedures */}
                {procedures && (
                  <section>
                    <button
                      type="button"
                      onClick={() => setProceduresOpen(!proceduresOpen)}
                      className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-red-700 dark:text-red-300 py-1"
                    >
                      {t("proceduresTitle")}
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${proceduresOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {proceduresOpen && (
                      <div className="mt-2 space-y-3">
                        {(
                          [
                            ["medical_emergencies", procedures.medical_emergencies],
                            ["police_and_security", procedures.police_and_security],
                            ["harassment_and_safety", procedures.harassment_and_safety],
                          ] as const
                        ).map(([key, value]) =>
                          value ? (
                            <div
                              key={key}
                              className="rounded-xl border border-sand/50 dark:border-nile-light/20 bg-white dark:bg-nile p-3"
                            >
                              <div className="text-sm font-semibold text-nile dark:text-sand capitalize">
                                {t(`proc.${key}`)}
                              </div>
                              <ol className="mt-1.5 space-y-1">
                                {value.steps.map((step: string, i: number) => (
                                  <li
                                    key={i}
                                    className="text-xs text-muted-foreground flex items-start gap-2"
                                  >
                                    <span className="w-4 h-4 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                                      {i + 1}
                                    </span>
                                    <span>{step}</span>
                                  </li>
                                ))}
                              </ol>
                            </div>
                          ) : null
                        )}
                      </div>
                    )}
                  </section>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
