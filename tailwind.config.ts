import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Saffron-led palette inspired by Indian heritage
        brand: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
          950: "#431407",
        },
        // Indian heritage accents
        kumkum: { DEFAULT: "#9E1B32", dark: "#701226", light: "#C2455E" },
        gold: { DEFAULT: "#D4A017", light: "#F0C75E" },
        cream: "#FFF6E5",
        sandal: "#F3E3C3",
        india: {
          saffron: "#FF9933",
          white: "#FFFFFF",
          green: "#138808",
          chakra: "#06038D",
        },
        ink: "#2b1a12",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(43,26,18,.08), 0 8px 24px rgba(158,27,50,.10)",
      },
    },
  },
  plugins: [],
};
export default config;
