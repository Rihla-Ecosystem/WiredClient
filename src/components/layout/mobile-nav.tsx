"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { Home, Map, MessageCircle, Shield, Compass, User } from "lucide-react";

const mobileLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/explore", label: "Explore", icon: Map },
  { href: "/chat", label: "Rafiq", icon: MessageCircle, special: true },
  { href: "/quests", label: "Quests", icon: Compass },
  { href: "/safety", label: "Safety", icon: Shield },
  { href: "/profile", label: "Profile", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-primary-200/20 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-1">
        {mobileLinks.map((link) => {
          const Icon = link.icon;
          const isActive =
            link.href === "/"
              ? pathname === "/"
              : pathname.includes(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200",
                isActive
                  ? link.special
                    ? "text-faience dark:text-faience scale-105"
                    : "text-primary-600 dark:text-primary-400 scale-105"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              )}
            >
              {isActive && (
                <span
                  className={cn(
                    "absolute -top-0.5 h-1 w-6 rounded-full",
                    link.special
                      ? "bg-faience"
                      : "bg-gradient-to-r from-gold-light to-gold"
                  )}
                />
              )}
              <Icon className="w-5 h-5" />
              <span
                className={cn(
                  "text-[10px] font-medium",
                  isActive && "font-semibold"
                )}
              >
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}