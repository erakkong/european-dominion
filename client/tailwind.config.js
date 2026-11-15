/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          300: '#fde047',
          400: '#facc15',
          500: '#d4af37',
          600: '#b8911c',
          700: '#997819'
        }
      }
    },
  },
  plugins: [],
}
