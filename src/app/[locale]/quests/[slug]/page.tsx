"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Lock,
  Sparkles,
  Trophy,
  Medal,
} from "lucide-react";

import { AuthGuard } from "@/components/layout/auth-guard";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ErrorMessage } from "@/components/shared/error-message";
import { journeysApi, type Journey, type CompleteStepResult } from "@/lib/api/journeys";
import { cn } from "@/lib/utils/cn";

export default function QuestDetailPage() {
  const t = useTranslations("quests");
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "";

  const [quest, setQuest] = useState<Journey | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [toast, setToast] = useState<CompleteStepResult | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await journeysApi.get(slug);
        if (cancelled) return;
        setError(null);
        setQuest(res.data);
      } catch (e) {
        if (cancelled) return;
        const message =
          e instanceof Error ? e.message : "Failed to load quest";
        setError(message);
        setQuest(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, retryKey]);

  const handleCompleteStep = async (stepNumber: number) => {
    if (!quest || completing) return;
    setCompleting(true);
    setToast(null);
    try {
      const res = await journeysApi.completeStep(quest.slug, stepNumber);
      setToast(res.data);
      setQuest((q) => (q ? { ...q, ...applyResult(q, res.data) } : q));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to complete step");
    } finally {
      setCompleting(false);
    }
  };

  const applyResult = (
    q: Journey,
    r: CompleteStepResult
  ): Partial<Journey> => {
    const completedSteps = r.completed;
    const isCompleted = r.journeyCompleted;
    const nextStep = isCompleted ? null : r.completed + 1;
    const startedAt = q.startedAt ?? new Date().toISOString();
    const completedAt = isCompleted
      ? new Date().toISOString()
      : q.completedAt;
    return { completedSteps, isCompleted, nextStep, startedAt, completedAt };
  };

  const pct =
    quest && quest.totalSteps > 0
      ? Math.round((quest.completedSteps / quest.totalSteps) * 100)
      : 0;

  return (
    <AuthGuard>
      <div className="min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8 max-w-3xl mx-auto pb-24 md:pb-8">
        <Link
          href="/quests"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gold mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("back")}
        </Link>

        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <ErrorMessage
              message={error}
              onRetry={() => setRetryKey((k) => k + 1)}
            />
          </div>
        ) : quest ? (
          <>
            <div className="bg-white dark:bg-nile rounded-2xl border border-sand/50 dark:border-nile-light/20 p-6 mb-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-serif font-bold text-nile dark:text-sand flex items-center gap-2">
                    {quest.title}
                    {quest.isCompleted && (
                      <Trophy className="w-5 h-5 text-gold" />
                    )}
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    {quest.description}
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full bg-gold/15 text-gold text-sm font-medium">
                  <Sparkles className="w-4 h-4" />
                  +{quest.xpReward} XP
                </div>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                  <span>
                    {t("yourProgress")} — {quest.completedSteps} {t("of")}{" "}
                    {quest.totalSteps} {t("steps")}
                  </span>
                  <span>{pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-sand/50 dark:bg-nile-light/40 overflow-hidden">
                  <div
                    className="h-full rounded-full gradient-gold transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {quest.steps.map((step, idx) => {
                const isDone = idx < quest.completedSteps;
                const isCurrent = idx === quest.completedSteps;
                const isLocked = idx > quest.completedSteps;
                return (
                  <div
                    key={step.id}
                    className={cn(
                      "rounded-2xl border p-5 transition-colors",
                      isDone
                        ? "bg-emerald-50/60 dark:bg-emerald-900/20 border-emerald-200/70 dark:border-emerald-800/40"
                        : isCurrent
                          ? "bg-white dark:bg-nile border-gold/60 dark:border-gold/50"
                          : "bg-white dark:bg-nile border-sand/50 dark:border-nile-light/20 opacity-70"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "flex items-center justify-center w-8 h-8 rounded-full shrink-0 text-sm font-bold",
                          isDone
                            ? "bg-emerald-500 text-white"
                            : isCurrent
                              ? "bg-gold text-white"
                              : "bg-sand/50 dark:bg-nile-light/40 text-muted-foreground"
                        )}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          step.stepNumber
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-nile dark:text-sand">
                          {t("stepTitle", { n: step.stepNumber })}
                          <span className="text-muted-foreground font-normal ml-2">
                            · {step.title}
                          </span>
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                          {step.content}
                        </p>

                        {isCurrent && !quest.isCompleted && (
                          <div className="mt-4">
                            <button
                              onClick={() =>
                                handleCompleteStep(step.stepNumber)
                              }
                              disabled={completing}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white gradient-gold hover:opacity-90 disabled:opacity-50 transition-opacity"
                            >
                              {completing ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-4 h-4" />
                              )}
                              {step.stepNumber === quest.totalSteps
                                ? t("finishQuest")
                                : t("markComplete")}
                            </button>
                            {step.stepNumber < quest.totalSteps && (
                              <span className="ml-3 text-xs text-muted-foreground">
                                +{step.xpReward} XP
                              </span>
                            )}
                          </div>
                        )}

                        {isLocked && (
                          <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Lock className="w-3.5 h-3.5" />
                            {t("stepLocked")}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {quest.isCompleted && (
              <div className="mt-6 rounded-2xl bg-emerald-50/60 dark:bg-emerald-900/20 border border-emerald-200/70 dark:border-emerald-800/40 p-5 flex items-center gap-3">
                <Medal className="w-6 h-6 text-emerald-500 shrink-0" />
                <div>
                  <p className="font-semibold text-emerald-700 dark:text-emerald-300">
                    {t("questCompleted")}
                  </p>
                  <p className="text-sm text-emerald-600/80 dark:text-emerald-400/80">
                    {t("completeAllSteps", {
                      theme: quest.slug.startsWith("scam") ||
                        quest.slug === "taxi-tricks" ||
                        quest.slug === "street-money-exchange" ||
                        quest.slug === "fake-guide-papyrus" ||
                        quest.slug === "atm-card-scam"
                        ? "Scam Shield"
                        : "Antiquity Explorer",
                    })}
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="min-h-[30vh] flex items-center justify-center text-muted-foreground">
            {t("notFound")}
          </div>
        )}

        {toast && (
          <div className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-50">
            <div className="bg-nile dark:bg-white text-sand dark:text-nile rounded-2xl px-5 py-4 shadow-xl flex items-center gap-3">
              {toast.journeyCompleted ? (
                <Trophy className="w-5 h-5 text-gold shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              )}
              <div className="text-sm">
                {toast.xpAwarded > 0 && (
                  <p className="font-semibold">
                    {t("xpEarned", { n: toast.xpAwarded })}
                  </p>
                )}
                {toast.badgesAwarded.map((badge) => (
                  <p key={badge} className="font-semibold">
                    {t("badgeEarned")}: {badge}
                  </p>
                ))}
                {toast.xpAwarded === 0 &&
                  toast.badgesAwarded.length === 0 && (
                    <p>{t("questCompleted")}</p>
                  )}
              </div>
              <button
                onClick={() => setToast(null)}
                className="ml-2 text-sand/70 dark:text-nile/70 hover:text-gold"
              >
                <span className="sr-only">Close</span>
                <ArrowRight className="w-4 h-4 rotate-180" />
              </button>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
