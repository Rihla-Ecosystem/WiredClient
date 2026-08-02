"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth-store";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { cn } from "@/lib/utils/cn";
import {
  MessageCircle,
  Map,
  Shield,
  Menu,
  X,
  LogOut,
  User,
  Wallet,
  Coins,
  Ticket,
  Compass,
  ChevronDown,
} from "lucide-react";

const navLinks = [
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/explore", label: "Explore", icon: Map },
  { href: "/tickets", label: "Tickets", icon: Ticket },
  { href: "/safety", label: "Safety", icon: Shield },
  { href: "/quests", label: "Quests", icon: Compass },
  { href: "/currency", label: "Money", icon: Coins },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 glass border-b border-primary-200/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="font-heading text-xl font-semibold text-gradient">
              Rihla
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.includes(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserOpen(!userOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full gradient-gold flex items-center justify-center text-white text-xs font-medium">
                    {user?.displayName?.charAt(0) || "U"}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user?.displayName}
                  </span>
                  <ChevronDown className="w-3 h-3 text-gray-500" />
                </button>

                {userOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 glass-card p-1.5 z-20">
                      <Link
                        href="/profile"
                        onClick={() => setUserOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                      <Link
                        href="/wallet"
                        onClick={() => setUserOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Wallet className="w-4 h-4" />
                        Wallet
                      </Link>
                      <Link
                        href="/quests"
                        onClick={() => setUserOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Compass className="w-4 h-4" />
                        Quests
                      </Link>
                      {user?.role === "admin" && (
                        <Link
                          href="/admin"
                          onClick={() => setUserOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Shield className="w-4 h-4" />
                          Admin
                        </Link>
                      )}
                      <hr className="my-1 border-gray-200 dark:border-gray-700" />
                      <button
                        onClick={() => {
                          logout();
                          setUserOpen(false);
                        }}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 text-sm font-medium text-white gradient-gold rounded-lg hover:opacity-90 transition-opacity"
                >
                  Register
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-primary-200/20 glass">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    pathname.includes(link.href)
                      ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
            {!isAuthenticated && (
              <div className="flex gap-2 pt-2">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center px-4 py-2 text-sm font-medium text-white gradient-gold rounded-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
