import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { 50: "#eef7ff", 100: "#d6ecff", 500: "#5aa9e6", 600: "#2b78b8", 700: "#1f5f94", 900: "#0d2a44" },
      },
    },
  },
  plugins: [],
} satisfies Config;
