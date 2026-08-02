"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ChevronLeft,
  ChevronRight,
  Compass,
  Heart,
  Calendar,
  CheckCircle2,
} from "lucide-react";

import { AuthGuard } from "@/components/layout/auth-guard";
import { useAuthStore } from "@/lib/stores/auth-store";

const TRAVEL_STYLES = [
  { value: "cultural", icon: "🏛️" },
  { value: "adventure", icon: "🏔️" },
  { value: "relaxation", icon: "🏖️" },
  { value: "family", icon: "👨‍👩‍👧‍👦" },
  { value: "solo", icon: "🧑‍🤝‍🧑" },
  { value: "romantic", icon: "💑" },
];

const BUDGET_LEVELS = [
  { value: "budget", labelKey: "budget" },
  { value: "mid", labelKey: "mid" },
  { value: "luxury", labelKey: "luxury" },
];

const ACCOMMODATION_TYPES = [
  { value: "hotel", labelKey: "hotel" },
  { value: "hostel", labelKey: "hostel" },
  { value: "resort", labelKey: "resort" },
  { value: "apartment", labelKey: "apartment" },
];

const INTEREST_OPTIONS = [
  { value: "history", icon: "🏛️" },
  { value: "photography", icon: "📷" },
  { value: "food", icon: "🍽️" },
  { value: "shopping", icon: "🛍️" },
  { value: "nature", icon: "🌿" },
];

export default function OnboardingPage() {
  const t = useTranslations("onboarding");
  const a = useTranslations("auth");
  const [step, setStep] = useState(0);
  const [travelStyle, setTravelStyle] = useState<string>("");
  const [budgetLevel, setBudgetLevel] = useState<string>("");
  const [accommodationType, setAccommodationType] = useState<string>("");
  const [interests, setInterests] = useState<string[]>([]);
  const [arrivalDate, setArrivalDate] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);

  const steps = [
    { label: t("stepPreferences"), icon: Compass },
    { label: t("stepInterests"), icon: Heart },
    { label: t("stepDates"), icon: Calendar },
    { label: t("stepComplete"), icon: CheckCircle2 },
  ];

  const toggleInterest = (value: string) => {
    setInterests((prev) =>
      prev.includes(value) ? prev.filter((i) => i !== value) : [...prev, value]
    );
  };

  const handleComplete = async () => {
    if (!user) return;
    const updated = {
      ...user,
      travelStyle: travelStyle || user.travelStyle,
      budgetLevel: budgetLevel || user.budgetLevel,
      accommodationType: accommodationType || user.accommodationType,
      interests: interests.length ? interests : user.interests,
      arrivalDate: arrivalDate || user.arrivalDate,
      departureDate: departureDate || user.departureDate,
    };
    setUser(updated);
    router.push("/chat");
  };

  const inputClass =
    "w-full px-4 py-2.5 rounded-lg border border-sand/60 dark:border-nile-light/40 bg-white dark:bg-nile-light text-nile dark:text-sand focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all";

  return (
    <AuthGuard>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-lg">
          {/* Steps */}
          <div className="flex items-center justify-between mb-10">
            {steps.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === step;
              const isDone = i < step;
              return (
                <div key={s.label} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                        isActive
                          ? "bg-gold text-white"
                          : isDone
                          ? "bg-green-500 text-white"
                          : "bg-sand/50 dark:bg-nile-light/30 text-muted-foreground"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs mt-1 text-muted-foreground hidden sm:block">
                      {s.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className={`w-8 sm:w-16 h-0.5 mx-2 ${
                        i < step
                          ? "bg-green-500"
                          : "bg-sand/50 dark:bg-nile-light/30"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Card */}
          <div className="bg-white dark:bg-nile rounded-2xl shadow-lg border border-sand/50 dark:border-nile-light/20 p-8">
            {/* Step 0: Preferences */}
            {step === 0 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-serif font-bold text-nile dark:text-sand">
                    {t("preferencesTitle")}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("preferencesDesc")}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-nile dark:text-sand mb-3">
                    {a("travelStyle")}
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {TRAVEL_STYLES.map((s) => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => setTravelStyle(s.value)}
                        className={`p-3 rounded-lg border text-center transition-all ${
                          travelStyle === s.value
                            ? "border-gold bg-gold/10 text-gold"
                            : "border-sand/60 dark:border-nile-light/40 text-muted-foreground hover:border-gold/50"
                        }`}
                      >
                        <span className="text-2xl block mb-1">{s.icon}</span>
                        <span className="text-xs font-medium">{a(s.value)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-nile dark:text-sand mb-3">
                    {a("budgetLevel")}
                  </label>
                  <div className="flex gap-3">
                    {BUDGET_LEVELS.map((b) => (
                      <button
                        key={b.value}
                        type="button"
                        onClick={() => setBudgetLevel(b.value)}
                        className={`flex-1 p-3 rounded-lg border text-center transition-all ${
                          budgetLevel === b.value
                            ? "border-gold bg-gold/10 text-gold"
                            : "border-sand/60 dark:border-nile-light/40 text-muted-foreground hover:border-gold/50"
                        }`}
                      >
                        <span className="text-sm font-medium">{a(b.labelKey)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-nile dark:text-sand mb-3">
                    {a("accommodationType")}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {ACCOMMODATION_TYPES.map((a) => (
                      <button
                        key={a.value}
                        type="button"
                        onClick={() => setAccommodationType(a.value)}
                        className={`p-3 rounded-lg border text-center transition-all ${
                          accommodationType === a.value
                            ? "border-gold bg-gold/10 text-gold"
                            : "border-sand/60 dark:border-nile-light/40 text-muted-foreground hover:border-gold/50"
                        }`}
                      >
                        <span className="text-sm font-medium">{a.labelKey}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Interests */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-serif font-bold text-nile dark:text-sand">
                    {t("interestsTitle")}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("interestsDesc")}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {INTEREST_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggleInterest(opt.value)}
                      className={`p-5 rounded-xl border text-center transition-all ${
                        interests.includes(opt.value)
                          ? "border-gold bg-gold/10 text-gold"
                          : "border-sand/60 dark:border-nile-light/40 text-muted-foreground hover:border-gold/50"
                      }`}
                    >
                      <span className="text-3xl block mb-2">{opt.icon}</span>
                      <span className="text-sm font-medium">{a(opt.value)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Dates */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-serif font-bold text-nile dark:text-sand">
                    {t("datesTitle")}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("datesDesc")}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-nile dark:text-sand mb-1.5">
                    {a("arrivalDate")}
                  </label>
                  <input
                    type="date"
                    value={arrivalDate}
                    onChange={(e) => setArrivalDate(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-nile dark:text-sand mb-1.5">
                    {a("departureDate")}
                  </label>
                  <input
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Complete */}
            {step === 3 && (
              <div className="text-center py-8 space-y-4">
                <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto" />
                <h2 className="text-2xl font-serif font-bold text-nile dark:text-sand">
                  {t("completeTitle")}
                </h2>
                <p className="text-muted-foreground">{t("completeDesc")}</p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-sand/50 dark:border-nile-light/20">
              {step > 0 && step < 3 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-nile dark:hover:text-sand transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
              ) : step === 3 ? (
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="text-sm text-muted-foreground hover:text-nile dark:hover:text-sand transition-colors"
                >
                  {t("skip")}
                </button>
              ) : (
                <div />
              )}

              {step === 3 ? (
                <button
                  type="button"
                  onClick={handleComplete}
                  className="px-6 py-2.5 bg-gold hover:bg-gold-dark text-white rounded-lg font-semibold transition-colors"
                >
                  {t("startExploring")}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="inline-flex items-center gap-1 px-6 py-2.5 bg-gold hover:bg-gold-dark text-white rounded-lg font-semibold transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
