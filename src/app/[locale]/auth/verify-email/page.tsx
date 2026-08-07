"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2, CheckCircle2, XCircle, Mail } from "lucide-react";

import { AuthLayout } from "@/components/auth/auth-layout";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { authApi } from "@/lib/api/auth";

type Status = "verifying" | "success" | "invalid" | "resending" | "idle";

function VerifyEmailForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>(token ? "verifying" : "idle");
  const [email, setEmail] = useState("");
  const [resendMsg, setResendMsg] = useState<string | null>(null);
  const [resendErr, setResendErr] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        await authApi.verifyEmail(token);
        if (!cancelled) setStatus("success");
      } catch {
        if (!cancelled) setStatus("invalid");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleResend = async () => {
    if (!email) return;
    setResendMsg(null);
    setResendErr(null);
    setStatus("resending");
    try {
      await authApi.resendVerification(email);
      setStatus("success");
      setResendMsg(t("resendSuccess"));
    } catch {
      setStatus("idle");
      setResendErr(t("resendError"));
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 rounded-lg border border-sand/60 dark:border-nile-light/40 bg-white dark:bg-nile-light text-nile dark:text-sand placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all";

  if (status === "verifying") {
    return (
      <div className="text-center py-8">
        <Loader2 className="w-12 h-12 text-gold mx-auto mb-4 animate-spin" />
        <p className="text-nile dark:text-sand font-medium">{t("verifyingEmail")}</p>
      </div>
    );
  }

  if (status === "success" && resendMsg) {
    return (
      <div className="text-center py-8">
        <Mail className="w-14 h-14 text-gold mx-auto mb-4" />
        <p className="text-nile dark:text-sand font-medium">{resendMsg}</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <p className="text-nile dark:text-sand font-medium">{t("verifySuccess")}</p>
        <p className="text-sm text-muted-foreground mt-2">{t("verifySuccessDesc")}</p>
        <button
          type="button"
          onClick={() => router.push("/auth/login")}
          className="mt-6 w-full py-3 bg-gold hover:bg-gold-dark text-white rounded-lg font-semibold transition-colors"
        >
          {t("goToLogin")}
        </button>
      </div>
    );
  }

  // invalid OR idle → show resend form
  return (
    <div className="text-center py-4">
      {status === "invalid" && (
        <XCircle className="w-14 h-14 text-red-500 mx-auto mb-4" />
      )}
      <p className="text-nile dark:text-sand font-medium">
        {token ? t("verifyInvalid") : t("verifyEmailHint")}
      </p>
      <p className="text-sm text-muted-foreground mt-2">{t("resendVerification")}</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleResend();
        }}
        className="mt-6 space-y-4"
      >
        <label className="block text-sm font-medium text-nile dark:text-sand mb-1.5">
          {t("email")}
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={inputClass}
          placeholder="you@example.com"
        />
        {resendErr && (
          <p className="text-sm text-red-500">{resendErr}</p>
        )}
        <button
          type="submit"
          disabled={!email || status === "resending"}
          className="w-full py-3 bg-gold hover:bg-gold-dark text-white rounded-lg font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {status === "resending" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t("resendVerification")}
            </>
          ) : (
            t("resendVerification")
          )}
        </button>
      </form>
    </div>
  );
}

function VerifyEmailPageInner() {
  const t = useTranslations("auth");
  const n = useTranslations("nav");

  return (
    <AuthLayout
      title={t("checkEmail")}
      subtitle=""
      altLink={{
        text: t("hasAccount"),
        label: n("login"),
        href: "/auth/login",
      }}
    >
      <VerifyEmailForm />
    </AuthLayout>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <VerifyEmailPageInner />
    </Suspense>
  );
}