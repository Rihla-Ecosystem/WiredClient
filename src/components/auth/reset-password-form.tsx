"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";

import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/validations/auth";

export function ResetPasswordForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    if (!token) {
      setError("Invalid or missing reset token");
      return;
    }
    setError(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_CORE_API_URL}/auth/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, token }),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Reset failed");
      }
      setSuccess(true);
      setTimeout(() => router.push("/auth/login"), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reset failed");
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <p className="text-nile dark:text-sand font-medium">
          {t("resetPassword")}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Redirecting to login...
        </p>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 font-medium">Invalid reset link</p>
        <p className="text-sm text-muted-foreground mt-2">
          This link is invalid or has expired.
        </p>
      </div>
    );
  }

  const inputClass =
    "w-full px-4 py-2.5 rounded-lg border border-sand/60 dark:border-nile-light/40 bg-white dark:bg-nile-light text-nile dark:text-sand placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div>
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

      <div>
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
          t("resetPassword")
        )}
      </button>
    </form>
  );
}
