/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#17a14e",
        backgroundLight: "#F8FAFC",
        glassWhite: "rgba(255,255,255,0.65)",
        borderSubtle: "rgba(226,232,240,0.8)",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        xl: "1.5rem",
      },
      boxShadow: {
        soft: "0 8px 30px rgba(0,0,0,0.04)",
      },
    },
  },
  plugins: [],
}