#!/usr/bin/env node
// One-off enrichment of the scraped egymonuments.com.json into a clean,
// categorized dataset with coordinates for the Explore integration.
// Run: node scripts/enrich-egymonuments.mjs
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const rawPath = resolve(root, "public/egymonuments.com.json");
const curatedPath = resolve(root, "scripts/curated-egymonuments.json");
const outPath = resolve(root, "public/egymonuments.clean.json");

const raw = JSON.parse(await readFile(rawPath, "utf8"));
if (!Array.isArray(raw)) throw new Error("Expected a JSON array");

const curated = JSON.parse(await readFile(curatedPath, "utf8"));
const curatedById = new Map(curated.map((e) => [e.id, e]));

const LOCATION = {
  cairo: { governorate: "Cairo", city: "Cairo", lat: 30.0444, lon: 31.2357 },
  giza: { governorate: "Giza", city: "Giza", lat: 29.987, lon: 31.212 },
  luxor: { governorate: "Luxor", city: "Luxor", lat: 25.6872, lon: 32.6396 },
  aswan: { governorate: "Aswan", city: "Aswan", lat: 24.0889, lon: 32.8998 },
  alexandria: { governorate: "Alexandria", city: "Alexandria", lat: 31.2001, lon: 29.9187 },
  minya: { governorate: "Minya", city: "Minya", lat: 28.1099, lon: 30.7503 },
  sohag: { governorate: "Sohag", city: "Sohag", lat: 26.5569, lon: 31.6948 },
  qena: { governorate: "Qena", city: "Qena", lat: 26.1644, lon: 32.7266 },
  "beni suef": { governorate: "Beni Suef", city: "Beni Suef", lat: 29.0661, lon: 31.0994 },
  ismailia: { governorate: "Ismailia", city: "Ismailia", lat: 30.5965, lon: 32.2715 },
  esna: { governorate: "Qena", city: "Esna", lat: 25.2934, lon: 32.5542 },
  edfu: { governorate: "Aswan", city: "Edfu", lat: 24.9786, lon: 32.8734 },
  "abu simbel": { governorate: "Aswan", city: "Abu Simbel", lat: 22.3372, lon: 31.6258 },
  siwa: { governorate: "Matrouh", city: "Siwa", lat: 29.2032, lon: 25.5197 },
  "sharm el sheikh": { governorate: "South Sinai", city: "Sharm El Sheikh", lat: 27.9158, lon: 34.33 },
  hurghada: { governorate: "Red Sea", city: "Hurghada", lat: 27.2579, lon: 33.8116 },
  assuit: { governorate: "Asyut", city: "Asyut", lat: 27.1809, lon: 31.1837 },
  "el-bahira": { governorate: "Beheira", city: "Rosetta", lat: 31.4021, lon: 30.4177 },
  "kafr el-shiekh": { governorate: "Kafr El Sheikh", city: "Kafr El Sheikh", lat: 31.1113, lon: 30.9395 },
  "al-sharqia": { governorate: "Sharqia", city: "San el-Hagar", lat: 30.9778, lon: 31.8814 },
};

// Precise coordinates for well-known landmarks (override the city centroid).
const LANDMARK = {
  Pyramids: { lat: 29.9792, lon: 31.1342 }, // Giza plateau
  SaqqaraMonuments: { lat: 29.871, lon: 31.2165 },
  Dahshur: { lat: 29.8078, lon: 31.2034 },
  Memphis: { lat: 29.8455, lon: 31.256 },
  AbuSimbelTemple: { lat: 22.3372, lon: 31.6258 },
  ValleyOfKings: { lat: 25.7402, lon: 32.6014 },
  ValleyOfTheQueens: { lat: 25.7277, lon: 32.5926 },
  LuxorTemple: { lat: 25.6995, lon: 32.6395 },
  KarnakTemple: { lat: 25.7188, lon: 32.6573 },
  MedinetHabu: { lat: 25.7198, lon: 32.6 },
  DeirElMadinaTemple: { lat: 25.7286, lon: 32.5934 },
  Ramesseum: { lat: 25.7276, lon: 32.6105 },
  ElAssasif: { lat: 25.7263, lon: 32.6076 },
  HatshepsutTemple: { lat: 25.7381, lon: 32.6067 },
  PhilaeTemple: { lat: 24.0239, lon: 32.8843 },
  KomOmboTemple: { lat: 24.4526, lon: 32.9286 },
  UnfinishedObelisk: { lat: 24.0779, lon: 32.8953 },
  NubiaMuseum: { lat: 24.0833, lon: 32.885 },
  ElephantineIsland: { lat: 24.0844, lon: 32.8881 },
  SehelIsland: { lat: 24.0608, lon: 32.8705 },
  TheTempleOfHorusAtEdfu: { lat: 24.9786, lon: 32.8734 },
  EsnaTemple: { lat: 25.2934, lon: 32.5542 },
  DandarahTemple: { lat: 26.1416, lon: 32.67 },
  AbydosTemple: { lat: 26.185, lon: 31.9189 },
  ThePyramidsofMeidum: { lat: 29.3887, lon: 31.1573 },
  BeniHassanTomb: { lat: 27.9333, lon: 30.8766 },
  "Tunael-Gebel": { lat: 27.7666, lon: 30.7 },
  Amarna: { lat: 27.63, lon: 30.95 },
  CitadelofQaitbay: { lat: 31.2137, lon: 29.8855 },
  KomelShoqafaCatacombs: { lat: 31.1754, lon: 29.8862 },
  SerapeumofAlexandria: { lat: 31.197, lon: 29.902 },
  RomanAmphitheatre: { lat: 31.1987, lon: 29.904 },
  GraecoRomanMuseum: { lat: 31.2009, lon: 29.9063 },
  SalahEldinCitadel: { lat: 30.0292, lon: 31.2613 },
  TempleofAghurmiinSiwa: { lat: 29.1928, lon: 25.5268 },
  "TombsofGabalal-Mawta": { lat: 29.2055, lon: 25.5219 },
  RosettaCityMonuments: { lat: 31.4021, lon: 30.4177 },
  "Tanis%28Sanal-Hagar%29": { lat: 30.9778, lon: 31.8814 },
  MeirMonumentalTombs: { lat: 27.44, lon: 30.7 },
  ZawyetSultan: { lat: 28.1, lon: 30.75 },
};

const ISLAMIC = [
  "mosque",
  "madrassa",
  "madrasa",
  "sultan hassan",
  "wikala",
  "sabiel",
  "bab zuwaila",
  "bab zuweila",
  "el-moez",
  "el-muizz",
  "suhaym",
  "gamal el-din",
  "gamal eldin",
  "al-ghuri",
  "al ghuri",
  "el-harawy",
  "wasila",
  "air dome",
];

const CHRISTIAN = [
  "monastery",
  "coptic",
  "mary's tree",
  "samaan",
  "simeon",
];

// Rule conflicts resolved by hand for accuracy.
const CATEGORY_OVERRIDE = {
  PrinceMohamedAliPalace: "archaeological",
  BaronEmpainPalace: "archaeological",
  GayerAndersonMuseum: "islamic",
  Houseofsuhaym: "islamic",
  Elharawy: "islamic",
  Gamaleldin: "islamic",
  Wasilahouse: "islamic",
  AlGhuriDome: "islamic",
  "WikalaOfAl-Guri": "islamic",
  SabielOfNafesa: "islamic",
  BabZuweila: "islamic",
  Elmoezstreet: "islamic",
  "Mosque-MadrassaSultanHassan": "islamic",
  RoyalJewelleryMuseum: "archaeological",
  RoyalChariotsMuseum: "archaeological",
};

function classify(id, title) {
  if (CATEGORY_OVERRIDE[id]) return CATEGORY_OVERRIDE[id];
  const text = `${id} ${title}`.toLowerCase();
  if (ISLAMIC.some((k) => text.includes(k))) return "islamic";
  if (CHRISTIAN.some((k) => text.includes(k))) return "christian";
  return "archaeological";
}

function cleanImages(images = []) {
  // Prefer the real photo buckets (events / all-you-needs) over the small
  // iteminfos placeholders and content-sheet PNGs.
  const keep = images.filter((u) => {
    if (u.includes("/events/")) return true;
    if (u.includes("/all-you-needs/")) return true;
    return false;
  });
  return [...new Set(keep)].slice(0, 4);
}

function normalizePrices(prices) {
  const clean = (p) =>
    p
      ? {
          adult: typeof p.adult === "number" ? p.adult : null,
          student: typeof p.student === "number" ? p.student : null,
        }
      : null;
  return {
    egyptian: clean(prices?.egyptian),
    foreigner: clean(prices?.foreigner),
  };
}

function resolveLocation(id, rawLocation) {
  const key = String(rawLocation || "").trim().toLowerCase();
  const base = LOCATION[key] || {
    governorate: null,
    city: String(rawLocation || "").trim() || null,
    lat: null,
    lon: null,
  };
  const landmark = LANDMARK[id];
  return {
    governorate: base.governorate,
    city: base.city,
    latitude: landmark ? landmark.lat : base.lat,
    longitude: landmark ? landmark.lon : base.lon,
  };
}

const clean = raw.map((entry) => {
  const category = classify(entry.id, entry.title);
  const location = resolveLocation(entry.id, entry.location);
  const curatedEntry = curatedById.get(entry.id);
  return {
    id: entry.id,
    title: curatedEntry?.title ?? String(entry.title || "").trim(),
    category,
    governorate: location.governorate,
    city: location.city,
    latitude: location.latitude,
    longitude: location.longitude,
    prices: normalizePrices(curatedEntry?.prices ?? entry.prices),
    opening_hours: curatedEntry?.opening_hours ?? (entry.opening_hours || {}),
    images:
      curatedEntry?.images?.length
        ? [...new Set(curatedEntry.images)].slice(0, 4)
        : cleanImages(entry.images),
    url: curatedEntry?.url ?? (entry.url || `https://egymonuments.com/details/${entry.id}`),
    description: String(curatedEntry?.description ?? (entry.description || "")).trim(),
  };
});

const missing = clean.filter(
  (m) =>
    !m.governorate ||
    typeof m.latitude !== "number" ||
    typeof m.longitude !== "number" ||
    m.images.length === 0 ||
    !m.category
);
if (missing.length > 0) {
  console.error("Entries failing validation:");
  for (const m of missing) console.error("  ", m.id, JSON.stringify(m));
  throw new Error(`${missing.length} entries incomplete`);
}

await mkdir(dirname(outPath), { recursive: true });
await writeFile(outPath, JSON.stringify(clean, null, 2));
console.log(`Wrote ${outPath} (${clean.length} monuments)`);
const cats = {};
for (const m of clean) cats[m.category] = (cats[m.category] || 0) + 1;
console.log("Categories:", cats);
