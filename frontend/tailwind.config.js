/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        zoho: {
          blue: '#0B57D0',
          red: '#F43F5E',
          green: '#10B981',
          yellow: '#F59E0B'
        }
      }
    },
  },
  plugins: [],
}
