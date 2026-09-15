import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        pitch: {
          DEFAULT: "#0b1220",
          light: "#121b2e",
          card: "#161f34",
          border: "#22304d",
        },
        accent: {
          DEFAULT: "#22c55e",
          dark: "#16a34a",
        },
        gold: "#f5c518",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
