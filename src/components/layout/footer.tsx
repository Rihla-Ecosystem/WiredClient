import Link from "next/link";
import {
  MessageCircle,
  Map,
  Shield,
  Github,
  Mail,
} from "lucide-react";
import { RihlaGlyph } from "@/components/shared/rihla-logo";

const SOCIAL_LINKS = [
  {
    label: "GitHub",
    href: "https://github.com/Rihla-Ecosystem/WiredClient",
    icon: Github,
  },
  {
    label: "Report an issue",
    href: "https://github.com/Rihla-Ecosystem/WiredClient/issues",
    icon: Mail,
  },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-primary-200/20 bg-white/60 dark:bg-gray-900/50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <RihlaGlyph size={40} />
              <span className="font-heading text-xl font-semibold text-gradient">
                Rihla
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm max-w-md leading-relaxed">
              Your intelligent AI travel companion for Egypt. Explore ancient
              wonders, stay safe, and discover hidden gems with personalized
              guidance.
            </p>
            <div className="flex items-center gap-2 pt-1">
              {SOCIAL_LINKS.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    title={s.label}
                    className="flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-800 px-3.5 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 hover:border-gold/60 hover:text-gold hover:bg-gold/5 transition-all"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{s.label}</span>
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="font-heading text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Features
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/chat"
                  className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gold transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  AI Chat
                </Link>
              </li>
              <li>
                <Link
                  href="/explore"
                  className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gold transition-colors"
                >
                  <Map className="w-3.5 h-3.5" />
                  Explore
                </Link>
              </li>
              <li>
                <Link
                  href="/safety"
                  className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gold transition-colors"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Safety
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Account
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/profile"
                  className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gold transition-colors"
                >
                  Profile &amp; badges
                </Link>
              </li>
              <li>
                <Link
                  href="/wallet"
                  className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gold transition-colors"
                >
                  Wallet &amp; tokens
                </Link>
              </li>
              <li>
                <Link
                  href="/notifications"
                  className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gold transition-colors"
                >
                  Notifications
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-800">
          <p className="text-center text-sm text-gray-500 dark:text-gray-500">
            &copy; {year} Rihla. All rights reserved. Built with care for
            Egypt&apos;s travelers.
          </p>
        </div>
      </div>
    </footer>
  );
}
