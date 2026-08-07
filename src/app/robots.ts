import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://localhost:3050";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/en/auth", "/ar/auth", "/en/onboarding", "/ar/onboarding"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}