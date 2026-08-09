"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { useAuthStore, type User } from "@/lib/stores/auth-store";
import { authApi } from "@/lib/api/auth";

export function LoginForm() {
  const t = useTranslations("auth");
  const n = useTranslations("nav");
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  const onSubmit = async (data: LoginInput) => {
    setError(null);
    try {
      const { data: loginRes } = await authApi.login({
        email: data.email,
        password: data.password,
      });

      let user: User = loginRes.user as User;
      try {
        const { data: profile } = await authApi.me();
        const raw = profile as User & { role?: unknown };
        const roleName =
          typeof raw.role === "object" && raw.role
            ? ((raw.role as { name?: string }).name as string)
            : (raw.role as string);
        user = { ...raw, role: roleName };
      } catch {
        // fall back to the partial user returned by login
      }

      setAuth(user, loginRes.accessToken);
      router.push("/chat");
    } catch (e) {
      const err = e as {
        response?: { data?: { error?: string }; status?: number };
        message?: string;
        code?: string;
      };
      setError(err?.response?.data?.error || err?.message || "Login failed");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-nile dark:text-sand mb-1.5"
        >
          {t("email")}
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          {...register("email")}
          className="w-full px-4 py-2.5 rounded-lg border border-sand/60 dark:border-nile-light/40 bg-white dark:bg-nile-light text-nile dark:text-sand placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
          placeholder="you@example.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-nile dark:text-sand mb-1.5"
        >
          {t("password")}
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            {...register("password")}
            className="w-full px-4 py-2.5 pr-10 rounded-lg border border-sand/60 dark:border-nile-light/40 bg-white dark:bg-nile-light text-nile dark:text-sand placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-nile dark:hover:text-sand transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            {...register("rememberMe")}
            className="w-4 h-4 rounded border-sand/60 text-gold focus:ring-gold/50"
          />
          Remember me
        </label>
        <Link
          href="/auth/forgot-password"
          className="text-sm text-gold hover:text-gold-dark font-medium transition-colors"
        >
          {t("forgotPassword")}
        </Link>
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
          n("login")
        )}
      </button>
    </form>
  );
}
