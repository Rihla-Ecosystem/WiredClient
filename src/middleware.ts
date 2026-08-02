import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "@/lib/i18n/config";
import type { NextRequest } from "next/server";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const publicPaths = [
    "/auth/login",
    "/auth/register",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/verify-email",
    "/explore",
    "/safety",
    "/leaderboard",
    "/tokens/packages",
  ];

  const isPublic = publicPaths.some((p) => pathname.includes(p));
  const isApi = pathname.includes("/api/");
  const isStatic = pathname.includes("/_next") || pathname.includes("/favicon");

  if (isApi || isStatic) {
    return intlMiddleware(request);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};
