import { create } from "zustand";

interface Site {
  id: string;
  name: string;
  name_en: string | null;
  name_ar: string | null;
  categories: string[];
  details: Record<string, unknown> | null;
  governorate?: string;
  distance_meters: number;
  lat: number;
  lon: number;
}

interface GeoState {
  mapCenter: [number, number];
  zoom: number;
  selectedCategory: string | null;
  selectedGovernorate: string | null;
  sites: Site[];
  isLoading: boolean;

  setCenter: (lat: number, lon: number) => void;
  setZoom: (zoom: number) => void;
  setCategory: (cat: string | null) => void;
  setGovernorate: (gov: string | null) => void;
  setSites: (sites: Site[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useGeoStore = create<GeoState>()((set) => ({
  mapCenter: [26.8206, 30.8025],
  zoom: 7,
  selectedCategory: null,
  selectedGovernorate: null,
  sites: [],
  isLoading: false,

  setCenter: (lat, lon) => set({ mapCenter: [lat, lon] }),
  setZoom: (zoom) => set({ zoom }),
  setCategory: (selectedCategory) => set({ selectedCategory }),
  setGovernorate: (selectedGovernorate) => set({ selectedGovernorate }),
  setSites: (sites) => set({ sites }),
  setLoading: (isLoading) => set({ isLoading }),
}));
