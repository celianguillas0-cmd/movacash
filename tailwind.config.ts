import type { Config } from "tailwindcss";

// Espace client en thème clair : palette Tailwind par défaut, une seule couleur d'accent (émeraude).
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { 50: "#ecfdf5", 100: "#d1fae5", 500: "#10b981", 600: "#047857", 700: "#065f46", 900: "#064e3b" },
      },
      fontFamily: {
        display: ["Inter", "Segoe UI", "system-ui", "sans-serif"],
        sans: ["Inter", "Segoe UI", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;
