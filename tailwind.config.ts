import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#231641",
        "background-light": "#F9F8F6",
        "background-dark": "#121212",
      },
      fontFamily: {
        display: ["var(--font-instrument-serif)", "serif"],
        sans: ["Roboto", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
    },
  },
  plugins: [],
};

export default config;
