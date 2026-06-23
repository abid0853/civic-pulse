/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"], // <-- THIS IS THE CRITICAL FIX
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};