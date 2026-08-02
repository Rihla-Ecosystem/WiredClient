import { useTranslations } from "next-intl";
import { AuthLayout } from "@/components/auth/auth-layout";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  const t = useTranslations("auth");
  const n = useTranslations("nav");

  return (
    <AuthLayout
      title={t("loginTitle")}
      subtitle={t("loginSubtitle")}
      altLink={{
        text: t("noAccount"),
        label: n("register"),
        href: "/auth/register",
      }}
    >
      <LoginForm />
    </AuthLayout>
  );
}
