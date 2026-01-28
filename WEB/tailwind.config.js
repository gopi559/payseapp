/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#029C58",
          secondary: "#3CB774",
          dark: "#2F653B",
          action: "#05A659",
          actionAlt: "#2AB461",
          success: "#54AA53",
          soft: "#6FC060",
          light: "#9DCF7D",
          surface: "#54B888",
          surfaceLight: "#97D2B5",
          surfaceMuted: "#D0EADC",
        },
      },
    },
  },
  plugins: [],
}


