export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/selfie-game/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        wedding: ['"Hernandez Bros"', "serif"], // Add your custom font
        "dancing-script": ["var(--font-dancing-script)"],
      },
      colors: {
        background: "#fef8f5",
        textPrimary: "#5a4d4d",
        accent: "#b084cc",
        secondaryAccent: "#ffe4e1",
      },
    },
  },
  plugins: [],
};