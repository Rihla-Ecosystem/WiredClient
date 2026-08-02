import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, MapPin, ShieldCheck, Bot } from "lucide-react";

export default function HomePage() {
  const t = useTranslations("landing");
  const c = useTranslations("common");
  const n = useTranslations("nav");
  const l = useTranslations("chat");

  const features = [
    {
      icon: Bot,
      title: t("featureChatTitle"),
      desc: t("featureChatDesc"),
      href: "/chat",
    },
    {
      icon: MapPin,
      title: t("featureGeoTitle"),
      desc: t("featureGeoDesc"),
      href: "/explore",
    },
    {
      icon: ShieldCheck,
      title: t("featureSafetyTitle"),
      desc: t("featureSafetyDesc"),
      href: "/safety",
    },
  ];

  const stats = [
    { value: "6,600+", label: t("statsSites") },
    { value: "11", label: t("statsCities") },
    { value: "3", label: t("statsPersonas") },
    { value: "15", label: t("statsSources") },
  ];

  const cities = [
    { name: "Cairo", nameAr: "القاهرة" },
    { name: "Luxor", nameAr: "الأقصر" },
    { name: "Aswan", nameAr: "أسوان" },
    { name: "Alexandria", nameAr: "الإسكندرية" },
    { name: "Sharm El Sheikh", nameAr: "شرم الشيخ" },
    { name: "Hurghada", nameAr: "الغردقة" },
    { name: "Giza", nameAr: "الجيزة" },
    { name: "Mansoura", nameAr: "المنصورة" },
    { name: "Fayoum", nameAr: "الفيوم" },
    { name: "Siwa", nameAr: "سيوة" },
    { name: "Abu Simbel", nameAr: "أبو سمبل" },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-nile/90 via-nile/70 to-sand/30" />
        <div className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center opacity-20" />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 text-white">
            {t("heroTitle")}{" "}
            <span className="text-gold">{c("appName")}</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            {t("heroSubtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/chat"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gold hover:bg-gold-dark text-white rounded-lg font-semibold transition-colors text-lg"
            >
              <Bot className="w-5 h-5" />
              {t("startChatting")}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/explore"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-lg font-semibold transition-colors text-lg"
            >
              <MapPin className="w-5 h-5" />
              {t("exploreSites")}
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white dark:bg-nile-dark py-12 border-y border-sand dark:border-nile">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-serif font-bold text-gold">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-sand/30 dark:bg-nile-dark">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-16 text-nile dark:text-sand">
            Why {c("appName")}?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={feature.title}
                  href={feature.href}
                  className="group p-8 bg-white dark:bg-nile rounded-xl shadow-sm hover:shadow-lg transition-all border border-sand/50 dark:border-nile-light/30"
                >
                  <div className="w-14 h-14 rounded-xl bg-gold/10 dark:bg-gold/20 flex items-center justify-center mb-6 group-hover:bg-gold/20 transition-colors">
                    <Icon className="w-7 h-7 text-gold" />
                  </div>
                  <h3 className="text-xl font-serif font-semibold mb-3 text-nile dark:text-sand">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.desc}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Cities */}
      <section className="py-20 bg-white dark:bg-nile-dark">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-16 text-nile dark:text-sand">
            {t("destinationsTitle")}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cities.map((city) => (
              <Link
                key={city.name}
                href={`/explore?city=${encodeURIComponent(city.name)}`}
                className="group p-5 bg-sand/20 dark:bg-nile rounded-lg border border-sand/30 dark:border-nile-light/20 hover:border-gold/50 transition-all"
              >
                <div className="font-serif font-semibold text-nile dark:text-sand group-hover:text-gold transition-colors">
                  {city.name}
                </div>
                <div className="text-sm text-muted-foreground mt-1 font-arabic">
                  {city.nameAr}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-gold to-gold-dark">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-6">
            {t("ctaTitle")}
          </h2>
          <p className="text-lg text-white/80 mb-10 max-w-xl mx-auto">
            {t("ctaDesc")}
          </p>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gold-dark rounded-lg font-semibold hover:bg-sand transition-colors text-lg"
          >
            <Bot className="w-5 h-5" />
            {t("startChatting")}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer extra */}
      <section className="py-8 bg-nile-dark text-center text-white/40 text-sm">
        &copy; {new Date().getFullYear()} {c("appName")}. All rights reserved.
      </section>
    </div>
  );
}
