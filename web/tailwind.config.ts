import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F9F6F0",
        "background-alt": "#F1EDE5",
        surface: "#FFFFFF",
        text: "#2C2C2C",
        "text-secondary": "#5C5C5C",
        primary: "#2E4A3E",
        accent: "#C9A86C",
        highlight: "#8B9A7D",
      },
      maxWidth: {
        content: "1280px",
      },
      borderRadius: {
        card: "10px",
      },
      boxShadow: {
        card: "0 4px 20px rgba(0, 0, 0, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
