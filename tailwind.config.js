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
      },
      colors: {
        main: '#d4f534',
        sec: '#111111',
        thr: '#f0f0f0',
      },
      fontFamily: {
        righteous: ['Righteous', 'cursive'],
        cabinetGrotesk: ['Cabinet Grotesk', 'sans-serif'],
        megrim: ['Megrim', 'cursive'],
        inter: ['Inter', 'sans-serif'],
        playfair: ['"Playfair Display"', 'serif'],
        plusJakartaSans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      animation: {
        'marquee': 'marquee 200s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
