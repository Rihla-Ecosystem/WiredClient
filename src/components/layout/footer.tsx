import Link from "next/link";
import {
  MessageCircle,
  Map,
  Shield,
  Github,
  X,
  Mail,
} from "lucide-react";
import { RihlaGlyph } from "@/components/shared/rihla-logo";

export function Footer() {
  return (
    <footer className="border-t border-primary-200/20 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <RihlaGlyph size={36} />
              <span className="font-heading text-xl font-semibold text-gradient">
                Rihla
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm max-w-md">
              Your intelligent AI travel companion for Egypt. Explore ancient
              wonders, stay safe, and discover hidden gems with personalized
              guidance.
            </p>
          </div>

          <div>
            <h3 className="font-heading text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Features
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/chat"
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  AI Chat
                </Link>
              </li>
              <li>
                <Link
                  href="/explore"
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors"
                >
                  <Map className="w-3.5 h-3.5" />
                  Explore
                </Link>
              </li>
              <li>
                <Link
                  href="/safety"
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Safety
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Connect
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  X (Twitter)
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-800">
          <p className="text-center text-sm text-gray-500 dark:text-gray-500">
            &copy; {new Date().getFullYear()} Rihla. All rights reserved.
            Built with care for Egypt&apos;s travelers.
          </p>
        </div>
      </div>
    </footer>
  );
}
