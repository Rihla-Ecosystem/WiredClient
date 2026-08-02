import { useTranslations } from "next-intl";
import { AuthLayout } from "@/components/auth/auth-layout";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const n = useTranslations("nav");

  return (
    <AuthLayout
      title={t("forgotPassword")}
      subtitle=""
      altLink={{
        text: t("hasAccount"),
        label: n("login"),
        href: "/auth/login",
      }}
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
