import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0058bc",
          light: "#4DA3FF",
          dark: "#004493",
          container: "#0070eb",
          fixed: "#d8e2ff",
        },
        secondary: {
          DEFAULT: "#50606e",
          container: "#d1e2f2",
          fixed: "#d4e5f5",
        },
        tertiary: {
          DEFAULT: "#894d00",
          container: "#ac6300",
          fixed: "#ffdcbf",
        },
        success: {
          DEFAULT: "#34C759",
          dark: "#006B27",
        },
        warning: {
          DEFAULT: "#FF9500",
        },
        danger: {
          DEFAULT: "#FF3B30",
        },
        surface: {
          DEFAULT: "#f7f9fc",
          dim: "#d8dadd",
          container: "#eceef1",
          "container-high": "#e6e8eb",
          "container-highest": "#e0e3e6",
          "container-low": "#f2f4f7",
          "container-lowest": "#ffffff",
          bright: "#f7f9fc",
        },
        "on-surface": {
          DEFAULT: "#191c1e",
          variant: "#414755",
        },
        "on-primary": {
          DEFAULT: "#ffffff",
          container: "#fefcff",
        },
        "on-secondary": {
          DEFAULT: "#ffffff",
          container: "#546472",
        },
        "on-tertiary": {
          DEFAULT: "#ffffff",
          container: "#fffbff",
        },
        outline: {
          DEFAULT: "#717786",
          variant: "#c1c6d7",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        headline: ["Manrope", "sans-serif"],
        body: ["Inter", "sans-serif"],
        label: ["Inter", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      boxShadow: {
        ambient: "0 12px 40px rgba(25, 28, 29, 0.06)",
        "ambient-lg": "0 20px 60px rgba(25, 28, 29, 0.08)",
        glass: "inset 0 1px 0 rgba(255,255,255,0.4)",
      },
      backdropBlur: {
        glass: "24px",
      },
    },
  },
  plugins: [],
};
export default config;
