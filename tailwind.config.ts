import type { Config } from "tailwindcss";

// Espace client en thème noir, blanc et transparent : les gris (slate) et les couleurs d'état sont inversés
// pour que les classes existantes (bg-slate-100, text-slate-600…) donnent directement un rendu sombre.
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Titres et boutons en noir et blanc, jamais de bleu ; couleurs douces seulement pour les états (vert, ambre, rouge)
        brand: { 50: "rgba(255,255,255,.06)", 100: "rgba(255,255,255,.14)", 500: "#e5e5e5", 600: "#ffffff", 700: "#ffffff", 900: "#ffffff" },
        slate: {
          50: "rgba(255,255,255,.02)", 100: "rgba(255,255,255,.06)", 200: "rgba(255,255,255,.10)", 300: "rgba(255,255,255,.18)", 400: "#737373",
          500: "#8f8f8f", 600: "#a8a8a8", 700: "#c8c8c8", 800: "#e5e5e5", 900: "#f5f5f5",
        },
        green: { 50: "#0d2118", 100: "#123022", 700: "#4ade80", 800: "#86efac" },
        amber: { 50: "#231a0c", 100: "#33250f", 700: "#fbbf24", 800: "#fcd34d" },
        red: { 50: "#2a1210", 100: "#3a1714", 200: "#5a221d", 400: "#f87171", 600: "#f87171", 700: "#fca5a5" },
        blue: { 50: "rgba(255,255,255,.05)", 900: "#ffffff" },
      },
      fontFamily: {
        display: ["Anton", "Oswald", "Impact", "Arial Narrow", "sans-serif"],
        sans: ["Manrope", "Segoe UI", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;
