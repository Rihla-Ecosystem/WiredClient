"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

interface FitBoundsProps {
  points: [number, number][];
}

export function FitBounds({ points }: FitBoundsProps) {
  const map = useMap();
  const key = points.map(([lat, lng]) => `${lat},${lng}`).join("|");
  useEffect(() => {
    if (points.length < 2) return;
    map.fitBounds(points, { padding: [50, 50], maxZoom: 15 });
  }, [map, key]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
