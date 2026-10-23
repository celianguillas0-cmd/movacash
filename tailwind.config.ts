import type { Config } from "tailwindcss";

// Espace client en thème noir, blanc et transparent : les gris (slate) et les couleurs d'état sont inversés
// pour que les classes existantes (bg-slate-100, text-slate-600…) donnent directement un rendu sombre.
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Noir, blanc et transparent uniquement : aucune teinte, les « couleurs » d'état sont des blancs translucides
        brand: { 50: "rgba(255,255,255,.06)", 100: "rgba(255,255,255,.14)", 500: "#e5e5e5", 600: "#ffffff", 700: "#ffffff", 900: "#ffffff" },
        slate: {
          50: "rgba(255,255,255,.02)", 100: "rgba(255,255,255,.06)", 200: "rgba(255,255,255,.10)", 300: "rgba(255,255,255,.18)", 400: "#737373",
          500: "#8f8f8f", 600: "#a8a8a8", 700: "#c8c8c8", 800: "#e5e5e5", 900: "#f5f5f5",
        },
        green: { 50: "rgba(255,255,255,.05)", 100: "rgba(255,255,255,.14)", 700: "#ffffff", 800: "#ffffff" },
        amber: { 50: "rgba(255,255,255,.05)", 100: "rgba(255,255,255,.14)", 700: "#e5e5e5", 800: "#ffffff" },
        red: { 50: "rgba(255,255,255,.06)", 100: "rgba(255,255,255,.10)", 200: "rgba(255,255,255,.28)", 400: "#ffffff", 600: "#ffffff", 700: "#ffffff" },
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
