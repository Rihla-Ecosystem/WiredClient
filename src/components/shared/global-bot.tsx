"use client";

import { Suspense, memo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { LocationBot } from "@/components/shared/location-bot";
import { EGYPT_CITIES } from "@/lib/utils/constants";

const CITY_COORDS: Record<string, { latitude: number; longitude: number }> = {
  "Cairo": { latitude: EGYPT_CITIES.cairo.lat, longitude: EGYPT_CITIES.cairo.lon },
  "Giza": { latitude: EGYPT_CITIES.giza.lat, longitude: EGYPT_CITIES.giza.lon },
  "Alexandria": { latitude: EGYPT_CITIES.alexandria.lat, longitude: EGYPT_CITIES.alexandria.lon },
  "Luxor": { latitude: EGYPT_CITIES.luxor.lat, longitude: EGYPT_CITIES.luxor.lon },
  "Aswan": { latitude: EGYPT_CITIES.aswan.lat, longitude: EGYPT_CITIES.aswan.lon },
  "Hurghada": { latitude: EGYPT_CITIES.hurghada.lat, longitude: EGYPT_CITIES.hurghada.lon },
  "Sharm El Sheikh": { latitude: EGYPT_CITIES.sharm_el_sheikh.lat, longitude: EGYPT_CITIES.sharm_el_sheikh.lon },
  "Dahab": { latitude: EGYPT_CITIES.dahab.lat, longitude: EGYPT_CITIES.dahab.lon },
  "Marsa Alam": { latitude: EGYPT_CITIES.marsa_alam.lat, longitude: EGYPT_CITIES.marsa_alam.lon },
  "Siwa Oasis": { latitude: EGYPT_CITIES.siwa_oasis.lat, longitude: EGYPT_CITIES.siwa_oasis.lon },
  "El Gouna": { latitude: EGYPT_CITIES.el_gouna.lat, longitude: EGYPT_CITIES.el_gouna.lon },
};

function GlobalBotInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tBot = useTranslations("bot");

  const route = pathname.split("/").filter(Boolean)[1] ?? "";

  if (route === "chat") return null;

  let persona: "auto" | "safety_guru" = "auto";
  let mode: "explore" | "safety" = "explore";
  let suggestions: string[] = [];

  if (route === "safety") {
    const city = searchParams.get("city") || "Cairo";
    const coords = CITY_COORDS[city];
    persona = "safety_guru";
    mode = "safety";
    suggestions = [
      tBot("suggestSafe"),
      tBot("suggestAvoid"),
      tBot("suggestBestTime"),
    ];
    return (
      <LocationBot
        initialLocation={coords}
        locationLabel={city}
        persona={persona}
        mode={mode}
        suggestions={suggestions}
      />
    );
  }

  if (route === "explore") {
    suggestions = [
      tBot("suggestNearby"),
      tBot("suggestHidden"),
      tBot("suggestHistory"),
      tBot("suggestBestTime"),
    ];
  } else {
    suggestions = [
      tBot("suggestNearby"),
      tBot("suggestHidden"),
      tBot("suggestHistory"),
    ];
  }

  return (
    <LocationBot
      persona={persona}
      mode={mode}
      suggestions={suggestions}
    />
  );
}

export const GlobalBot = memo(function GlobalBot() {
  return (
    <Suspense fallback={null}>
      <GlobalBotInner />
    </Suspense>
  );
});
