export const PERSONAS = [
  { value: "auto", label: "Auto", icon: "Sparkles", description: "Smart persona selection" },
  { value: "tour_guide", label: "Tour Guide", icon: "Compass", description: "History & attractions" },
  { value: "local_expert", label: "Local Expert", icon: "Coffee", description: "Food & local tips" },
  { value: "safety_guru", label: "Safety Guru", icon: "Shield", description: "Safety & scams" },
] as const;

export const EGYPT_CITIES = {
  cairo: { lat: 30.0444, lon: 31.2357 },
  giza: { lat: 29.9773, lon: 31.1325 },
  alexandria: { lat: 31.2001, lon: 29.9187 },
  luxor: { lat: 25.6872, lon: 32.6396 },
  aswan: { lat: 24.0889, lon: 32.8998 },
  hurghada: { lat: 27.2579, lon: 33.8116 },
  sharm_el_sheikh: { lat: 27.9158, lon: 34.33 },
  dahab: { lat: 28.5091, lon: 34.5136 },
  marsa_matruh: { lat: 31.3543, lon: 27.2373 },
  marsa_alam: { lat: 25.0711, lon: 34.8887 },
  el_gouna: { lat: 27.3942, lon: 33.6783 },
  siwa_oasis: { lat: 29.2032, lon: 25.5197 },
  port_said: { lat: 31.2653, lon: 32.3019 },
} as const;

export const SEVERITY_COLORS = {
  info: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300", dot: "bg-blue-500" },
  advisory: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-300", dot: "bg-yellow-500" },
  warning: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-300", dot: "bg-orange-500" },
  critical: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300", dot: "bg-red-500" },
} as const;
