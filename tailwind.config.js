/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        xl: '1100px',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
