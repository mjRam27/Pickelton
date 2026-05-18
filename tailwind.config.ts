import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#0e0e0e",
        surface: "#131313",
        "surface-low": "#1a1a1a",
        "surface-high": "#20201f",
        "surface-highest": "#262626",
        primary: "#95aaff",
        "primary-container": "#829bff",
        secondary: "#b8f600",
        "secondary-dim": "#ade700",
        tertiary: "#ffaced",
        error: "#ff6e84",
        "error-container": "#a70138",
        "on-surface": "#ffffff",
        "on-surface-variant": "#adaaaa",
        "on-secondary": "#415900",
        outline: "#484847"
      },
      fontFamily: {
        headline: ["var(--font-lexend)", "sans-serif"],
        body: ["var(--font-manrope)", "sans-serif"]
      },
      boxShadow: {
        ambient: "0px 24px 48px rgba(0, 0, 0, 0.4)",
        glow: "0 0 42px rgba(184, 246, 0, 0.14)"
      }
    }
  },
  plugins: []
};

export default config;
