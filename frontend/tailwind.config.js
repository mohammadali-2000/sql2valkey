/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        valkey: {
          light: '#f1f5f9',
          dark: '#0f172a',
          accent: '#0ea5e9' // sky-500
        }
      }
    },
  },
  plugins: [],
}
