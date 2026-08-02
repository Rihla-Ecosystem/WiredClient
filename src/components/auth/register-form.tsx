"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";

import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { authApi, type RegisterPayload } from "@/lib/api/auth";

const INTEREST_OPTIONS = [
  "history",
  "photography",
  "food",
  "shopping",
  "nature",
] as const;

const TRAVEL_STYLES = [
  "cultural",
  "adventure",
  "relaxation",
  "family",
  "solo",
  "romantic",
] as const;

const BUDGET_LEVELS = ["budget", "mid", "luxury"] as const;

const ACCOMMODATION_TYPES = ["hotel", "hostel", "resort", "apartment"] as const;

export function RegisterForm() {
  const t = useTranslations("auth");
  const n = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
      gender: null,
      nationality: "",
      budgetLevel: null,
      travelStyle: null,
      interests: [],
      accommodationType: null,
      arrivalDate: "",
      departureDate: "",
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    setError(null);
    try {
      const payload: RegisterPayload = {
        display_name: data.displayName,
        email: data.email,
        password: data.password,
        gender: data.gender || undefined,
        nationality: data.nationality || undefined,
        language: [locale === "ar" ? "ar" : "en"],
        budget_level: data.budgetLevel || undefined,
        travel_style: data.travelStyle || undefined,
        interests: data.interests?.length ? data.interests : undefined,
        accommodation_type: data.accommodationType || undefined,
        arrival_date: data.arrivalDate || undefined,
        departure_date: data.departureDate || undefined,
      };

      await authApi.register(payload);
      setSuccess(true);
    } catch (e) {
      const err = e as {
        response?: { data?: { error?: string } };
        message?: string;
      };
      setError(
        err?.response?.data?.error || err?.message || "Registration failed"
      );
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 rounded-lg border border-sand/60 dark:border-nile-light/40 bg-white dark:bg-nile-light text-nile dark:text-sand placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all";

  return success ? (
    <div className="p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-center">
      <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-3" />
      <h3 className="text-lg font-serif font-bold text-nile dark:text-sand mb-2">
        {t("registrationSuccess")}
      </h3>
      <p className="text-sm text-muted-foreground mb-5">{t("verifyEmailHint")}</p>
      <button
        type="button"
        onClick={() => router.push(`/${locale}/auth/login`)}
        className="px-6 py-2.5 bg-gold hover:bg-gold-dark text-white rounded-lg font-semibold transition-colors"
      >
        {t("goToLogin")}
      </button>
    </div>
  ) : (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-sm font-medium text-nile dark:text-sand mb-1.5">
            {t("displayName")}
          </label>
          <input {...register("displayName")} className={inputClass} placeholder="Ahmed" />
          {errors.displayName && (
            <p className="mt-1 text-sm text-red-500">{errors.displayName.message}</p>
          )}
        </div>

        <div className="col-span-2 sm:col-span-1">
          <label className="block text-sm font-medium text-nile dark:text-sand mb-1.5">
            {t("email")}
          </label>
          <input type="email" {...register("email")} className={inputClass} placeholder="you@example.com" />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="col-span-2 sm:col-span-1">
          <label className="block text-sm font-medium text-nile dark:text-sand mb-1.5">
            {t("password")}
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              className={inputClass + " pr-10"}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">{t("passwordRequirements")}</p>
        </div>

        <div className="col-span-2 sm:col-span-1">
          <label className="block text-sm font-medium text-nile dark:text-sand mb-1.5">
            {t("confirmPassword")}
          </label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              {...register("confirmPassword")}
              className={inputClass + " pr-10"}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              tabIndex={-1}
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="col-span-2 sm:col-span-1">
          <label className="block text-sm font-medium text-nile dark:text-sand mb-1.5">
            {t("gender")}
          </label>
          <select {...register("gender")} className={inputClass}>
            <option value="">--</option>
            <option value="MALE">{t("male")}</option>
            <option value="FEMALE">{t("female")}</option>
          </select>
        </div>

        <div className="col-span-2 sm:col-span-1">
          <label className="block text-sm font-medium text-nile dark:text-sand mb-1.5">
            {t("nationality")}
          </label>
          <input {...register("nationality")} className={inputClass} placeholder="Egypt" />
        </div>

        <div className="col-span-2 sm:col-span-1">
          <label className="block text-sm font-medium text-nile dark:text-sand mb-1.5">
            {t("budgetLevel")}
          </label>
          <select {...register("budgetLevel")} className={inputClass}>
            <option value="">--</option>
            {BUDGET_LEVELS.map((b) => (
              <option key={b} value={b}>
                {t(b)}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-2 sm:col-span-1">
          <label className="block text-sm font-medium text-nile dark:text-sand mb-1.5">
            {t("travelStyle")}
          </label>
          <select {...register("travelStyle")} className={inputClass}>
            <option value="">--</option>
            {TRAVEL_STYLES.map((s) => (
              <option key={s} value={s}>
                {t(s)}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-nile dark:text-sand mb-1.5">
            {t("interests")}
          </label>
          <div className="flex flex-wrap gap-3">
            {INTEREST_OPTIONS.map((interest) => (
              <label
                key={interest}
                className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer"
              >
                <input
                  type="checkbox"
                  value={interest}
                  {...register("interests")}
                  className="w-4 h-4 rounded border-sand/60 text-gold focus:ring-gold/50"
                />
                {t(interest)}
              </label>
            ))}
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1">
          <label className="block text-sm font-medium text-nile dark:text-sand mb-1.5">
            {t("accommodationType")}
          </label>
          <select {...register("accommodationType")} className={inputClass}>
            <option value="">--</option>
            {ACCOMMODATION_TYPES.map((a) => (
              <option key={a} value={a}>
                {t(a)}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-2 sm:col-span-1" />

        <div className="col-span-2 sm:col-span-1">
          <label className="block text-sm font-medium text-nile dark:text-sand mb-1.5">
            {t("arrivalDate")}
          </label>
          <input type="date" {...register("arrivalDate")} className={inputClass} />
        </div>

        <div className="col-span-2 sm:col-span-1">
          <label className="block text-sm font-medium text-nile dark:text-sand mb-1.5">
            {t("departureDate")}
          </label>
          <input type="date" {...register("departureDate")} className={inputClass} />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 bg-gold hover:bg-gold-dark text-white rounded-lg font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {t("loading")}
          </>
        ) : (
          n("register")
        )}
      </button>
    </form>
  );
}
