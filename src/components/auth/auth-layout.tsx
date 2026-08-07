import Link from "next/link";
import { RihlaGlyph } from "@/components/shared/rihla-logo";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  altLink: {
    label: string;
    href: string;
    text: string;
  };
}

export function AuthLayout({ children, title, subtitle, altLink }: AuthLayoutProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Decorative pyramid glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(60% 50% at 50% 0%, color-mix(in srgb, var(--gold) 12%, transparent), transparent)",
        }}
      />
      <div className="w-full max-w-md relative">
        <div className="rounded-2xl shadow-lg border border-sand/40 dark:border-nile-light/20 bg-card/60 backdrop-blur-lg p-8 md:p-10">
          <div className="text-center mb-8 flex flex-col items-center">
            <RihlaGlyph size={56} />
            <h1 className="font-heading text-2xl font-semibold text-fg-body mt-4">{title}</h1>
            <p className="text-muted-foreground mt-2 text-sm">{subtitle}</p>
          </div>
          {children}
        </div>
        <p className="text-center text-sm text-muted-foreground mt-6">
          {altLink.text}{" "}
          <Link
            href={altLink.href}
            className="text-gold hover:text-gold-dark font-semibold transition-colors"
          >
            {altLink.label}
          </Link>
        </p>
      </div>
    </div>
  );
}