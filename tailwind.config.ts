import type { Config } from "tailwindcss";

// Espace client en thème clair : palette Tailwind par défaut, accent noir (pas de vert).
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { 50: "#f3f4f6", 100: "#e5e7eb", 500: "#374151", 600: "#111827", 700: "#000000", 900: "#000000" },
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
