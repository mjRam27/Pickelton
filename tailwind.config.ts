import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#0b1005",
        surface: "#11180a",
        "surface-low": "#17220d",
        "surface-high": "#223314",
        "surface-highest": "#2f441d",
        primary: "#c8ee4f",
        "primary-container": "#b8dc43",
        secondary: "#9fcf3a",
        "secondary-dim": "#8aba2e",
        tertiary: "#e1f7a3",
        error: "#f27c8a",
        "error-container": "#a70138",
        "on-surface": "#eef5df",
        "on-surface-variant": "#a9b493",
        "on-secondary": "#192400",
        outline: "#4b5f2e"
      },
      fontFamily: {
        headline: ["var(--font-lexend)", "sans-serif"],
        body: ["var(--font-manrope)", "sans-serif"]
      },
      boxShadow: {
        ambient: "0px 24px 48px rgba(0, 0, 0, 0.4)",
        glow: "0 0 42px rgba(200, 238, 79, 0.18)"
      }
    }
  },
  plugins: []
};

export default config;
