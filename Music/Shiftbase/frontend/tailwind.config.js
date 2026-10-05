/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#ececeb",
        ink: "#222222",
        copy: "#4a4a4a",
        glass: {
          line: "rgba(255, 255, 255, 0.36)",
          sheen: "rgba(255, 255, 255, 0.12)",
          panel: "rgba(255, 255, 255, 0.65)",
          dark: "rgba(34, 34, 34, 0.75)",
        },
        ruby: {
          light: "#bd4468",
          DEFAULT: "#ad314d",
          dark: "#8c1320",
          deep: "#501c27",
        },
        amethyst: {
          light: "#c9b5e1",
          DEFAULT: "#ad80ca",
          mid: "#9d4f72",
          dark: "#793246",
        },
        terracotta: {
          light: "#e8703d",
          DEFAULT: "#dd523c",
          warm: "#d84736",
          dark: "#d34239",
        },
      },
      fontFamily: {
        sans: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'card-spatial': '0 2px 4px rgba(50, 28, 39, 0.30), inset 0 1px 0 rgba(255, 255, 255, 0.24)',
        'pill-button': '0 1px 0 rgba(255, 255, 255, 0.50) inset, 0 1px 3px rgba(58, 25, 39, 0.08)',
        'pill-hover': '0 8px 20px rgba(58, 25, 39, 0.16)',
        'glass-panel': '0 20px 40px -15px rgba(0, 0, 0, 0.07), 0 0 0 1px rgba(255, 255, 255, 0.5) inset',
      },
    },
  },
  plugins: [],
}
