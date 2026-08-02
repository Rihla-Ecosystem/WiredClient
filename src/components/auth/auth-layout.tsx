import Link from "next/link";

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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-nile rounded-2xl shadow-lg border border-sand/50 dark:border-nile-light/20 p-8 md:p-10">
          <div className="text-center mb-8">
            <Link
              href="/"
              className="inline-block text-3xl font-serif font-bold text-gold mb-3"
            >
              Rihla
            </Link>
            <h1 className="text-2xl font-serif font-bold text-nile dark:text-sand">
              {title}
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">{subtitle}</p>
          </div>
          {children}
        </div>
        <p className="text-center text-sm text-muted-foreground mt-6">
          {altLink.text}{" "}
          <Link
            href={altLink.href}
            className="text-gold hover:text-gold-dark font-medium transition-colors"
          >
            {altLink.label}
          </Link>
        </p>
      </div>
    </div>
  );
}
