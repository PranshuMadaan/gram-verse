/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        command: {
          bg: "#080c14",
          surface: "#0e1624",
          card: "#131d2e",
          border: "#1e2d42",
          borderLight: "#2a3d56",
          accent: "#00e5ff",
          accentDark: "#0284c7",
          emerald: "#10b981",
          amber: "#f59e0b",
          rose: "#f43f5e",
          text: "#f1f5f9",
          muted: "#94a3b8",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      boxShadow: {
        command: "0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 1px 1px rgba(255, 255, 255, 0.05)",
        glow: "0 0 15px -3px rgba(0, 229, 255, 0.25)",
        glowEmerald: "0 0 15px -3px rgba(16, 185, 129, 0.25)",
      },
    },
  },
  plugins: [],
};
