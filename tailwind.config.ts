import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#11131b",
        surface: {
          DEFAULT: "#11131b",
          dim: "#11131b",
          bright: "#373942",
          container: {
            DEFAULT: "#1d1f28",
            low: "#191b23",
            high: "#282a32",
            highest: "#33343d",
            lowest: "#0c0e16",
          },
          variant: "#33343d",
          tint: "#bac3ff",
        },
        primary: {
          DEFAULT: "#bac3ff",
          container: "#4453a7",
          fixed: "#dee0ff",
          "fixed-dim": "#bac3ff",
        },
        "on-primary": {
          DEFAULT: "#15267b",
          container: "#c9cfff",
          fixed: "#00105b",
          "fixed-variant": "#2f3f92",
        },
        secondary: {
          DEFAULT: "#45d8ed",
          container: "#00bacd",
          fixed: "#98f0ff",
          "fixed-dim": "#45d8ed",
        },
        "on-secondary": {
          DEFAULT: "#00363d",
          container: "#00444d",
          fixed: "#001f24",
          "fixed-variant": "#004f58",
        },
        tertiary: {
          DEFAULT: "#ffb784",
          container: "#8f4700",
          fixed: "#ffdcc6",
          "fixed-dim": "#ffb784",
        },
        "on-tertiary": {
          DEFAULT: "#502500",
          container: "#ffc7a2",
          fixed: "#301400",
          "fixed-variant": "#713700",
        },
        error: {
          DEFAULT: "#ffb4ab",
          container: "#93000a",
        },
        "on-error": {
          DEFAULT: "#690005",
          container: "#ffdad6",
        },
        "on-surface": {
          DEFAULT: "#e1e1ed",
          variant: "#c5c5d4",
        },
        "on-background": "#e1e1ed",
        outline: {
          DEFAULT: "#8f909e",
          variant: "#454652",
        },
        inverse: {
          surface: "#e1e1ed",
          "on-surface": "#2e3039",
          primary: "#4858ab",
        },
      },
      fontFamily: {
        headline: ["var(--font-manrope)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        label: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
      },
    },
  },
  plugins: [],
};

export default config;
