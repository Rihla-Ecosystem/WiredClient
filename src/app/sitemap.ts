import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://localhost:3050";

const PUBLIC_PATHS = [
  "",
  "/explore",
  "/quests",
  "/safety",
  "/tickets",
  "/currency",
  "/chat",
  "/leaderboard",
];

const LOCALES = ["en", "ar"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [];
  for (const locale of LOCALES) {
    for (const path of PUBLIC_PATHS) {
      entries.push({
        url: `${SITE_URL}/${locale}${path}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: path === "" ? 1.0 : 0.8,
      });
    }
  }
  return entries;
}