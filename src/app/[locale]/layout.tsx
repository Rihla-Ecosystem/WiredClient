import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { QueryProvider } from "@/providers/query-provider";
import { SessionProvider } from "@/providers/session-provider";
import { TopBar } from "@/components/layout/top-bar";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { EmergencyContacts } from "@/components/shared/emergency-contacts";
import { SensitiveAreaNotice } from "@/components/shared/sensitive-area-notice";
import { RafiqLauncher } from "@/components/shared/rafiq-launcher";
import "./globals.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "common" });
  return {
    title: {
      default: `${t("appName")} — ${t("tagline")}`,
      template: `%s — ${t("appName")}`,
    },
    description: t("tagline"),
    icons: { icon: "/logo.png", apple: "/logo.png" },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <QueryProvider>
        <SessionProvider>
          <TopBar />
          <main className="flex-1">{children}</main>
          <Footer />
          <MobileNav />
          <EmergencyContacts />
          <RafiqLauncher />
          <SensitiveAreaNotice />
        </SessionProvider>
      </QueryProvider>
    </NextIntlClientProvider>
  );
}
