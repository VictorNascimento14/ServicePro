/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#13ec80",
        "primary-content": "#102219",
        "primary-dark": "#0eb561",
        "background-light": "#f6f8f7",
        "background-dark": "#102219",
        "surface-light": "#ffffff",
        "surface-dark": "#1c3026",
        "card-dark": "#1A2C23",
        "text-main": "#111814",
        "text-muted": "#618975",
        "border-light": "#e5e7eb",
        "border-dark": "#2d4a3e",
      },
      fontFamily: {
        "display": ["Manrope", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "2xl": "1rem",
        "full": "9999px"
      },
    },
  },
  plugins: [],
}

