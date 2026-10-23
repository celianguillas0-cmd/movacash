import type { Config } from "tailwindcss";

// Espace client en thème sombre « bleu glacier » : les gris (slate) et les couleurs d'état sont inversés
// pour que les classes existantes (bg-slate-100, text-slate-600…) donnent directement un rendu sombre.
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { 50: "#0c1a26", 100: "#13283a", 500: "#7cc0f5", 600: "#a5d8ff", 700: "#c9e8ff", 900: "#e8f5ff" },
        // Thème noir et transparent : fonds et bordures en blanc translucide
        slate: {
          50: "rgba(255,255,255,.02)", 100: "rgba(255,255,255,.06)", 200: "rgba(255,255,255,.10)", 300: "rgba(255,255,255,.18)", 400: "#6f6f77",
          500: "#8b8b93", 600: "#a3a3aa", 700: "#c4c4ca", 800: "#e2e2e6", 900: "#f3f3f5",
        },
        green: { 50: "#0d2118", 100: "#123022", 700: "#7fe0b0", 800: "#9be8c1" },
        amber: { 50: "#231a0c", 100: "#33250f", 700: "#f5c071", 800: "#f7cd8d" },
        red: { 50: "#2a1210", 100: "#3a1714", 200: "#5a221d", 400: "#f07a6e", 600: "#f59389", 700: "#f7a59d" },
        blue: { 50: "#0c1a26", 900: "#d6ecff" },
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
