import { useTranslations } from "next-intl";
import { AuthLayout } from "@/components/auth/auth-layout";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  const t = useTranslations("auth");
  const n = useTranslations("nav");

  return (
    <AuthLayout
      title={t("registerTitle")}
      subtitle={t("registerSubtitle")}
      altLink={{
        text: t("hasAccount"),
        label: n("login"),
        href: "/auth/login",
      }}
    >
      <RegisterForm />
    </AuthLayout>
  );
}
