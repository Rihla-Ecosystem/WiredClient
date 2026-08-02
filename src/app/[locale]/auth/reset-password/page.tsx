import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { AuthLayout } from "@/components/auth/auth-layout";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

function ResetPasswordPageInner() {
  const t = useTranslations("auth");

  return (
    <AuthLayout
      title={t("resetPassword")}
      subtitle=""
      altLink={{
        text: t("hasAccount"),
        label: "Login",
        href: "/auth/login",
      }}
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ResetPasswordPageInner />
    </Suspense>
  );
}
