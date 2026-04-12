import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#F0F0F0",
        fg: "#121212",
        card: "#FFFFFF",
        bh: {
          red: "#D02020",
          blue: "#1040C0",
          yellow: "#F0C020",
        },
        muted: "#6B6B6B",
        border: "#121212",
      },
      fontFamily: {
        sans: ["Outfit", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        hard: "4px 4px 0 #121212",
        "hard-sm": "2px 2px 0 #121212",
        "hard-lg": "6px 6px 0 #121212",
        "hard-hover": "6px 6px 0 #121212",
        "hard-press": "1px 1px 0 #121212",
      },
    },
  },
  plugins: [],
};

export default config;
