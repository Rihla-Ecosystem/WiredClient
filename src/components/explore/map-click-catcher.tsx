"use client";

import { useMapEvents } from "react-leaflet";

interface MapClickCatcherProps {
  onMapClick?: (lat: number, lng: number) => void;
}

export function MapClickCatcher({ onMapClick }: MapClickCatcherProps) {
  useMapEvents({
    click(e) {
      onMapClick?.(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}
