/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-out',
      },
      colors: {
        'chirp': {
          purple: '#a855f7',
          'purple-hover': '#9333ea',
          'purple-subtle': 'rgba(168, 85, 247, 0.1)',
        },
        'twitter': {
          blue: '#a855f7', // Remapped to purple
          darkBlue: '#9333ea',
          gray: '#71767b',
          lightGray: '#2f3336',
          darkGray: '#16181c',
          green: '#00ba7c',
          red: '#f4212e',
        }
      }
    },
  },
  plugins: [],
}
