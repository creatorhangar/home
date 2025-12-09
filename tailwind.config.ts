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
        primary: {
          DEFAULT: "#231641",
          light: "#3A2665",
          dark: "#140C26",
        },
        secondary: {
          DEFAULT: "#FF006E", // Vibrant accent
          light: "#FF3389",
          dark: "#CC0058",
        },
        "background-light": "#FAFAFA",
        "background-dark": "#0A0A0A",
        surface: "#FFFFFF",
        "surface-dark": "#1E1E1E",
      },
      fontFamily: {
        display: ['"Instrument Serif"', 'serif'],
        sans: ['"Inter"', '"Roboto"', 'sans-serif'],
        luxury: ['"Cinzel"', 'serif'],
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
