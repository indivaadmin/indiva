import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef6ff",
          100: "#d9eaff",
          200: "#bcdbff",
          300: "#8ec4ff",
          400: "#59a3ff",
          500: "#3380fc",
          600: "#1b62f1",
          700: "#144ce1",
          800: "#173fb6",
          900: "#193a8f",
          950: "#142557",
        },
        ink: "#0f172a",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,23,42,.06), 0 8px 24px rgba(15,23,42,.08)",
      },
    },
  },
  plugins: [],
};
export default config;
