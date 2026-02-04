/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'chirp': {
          purple: '#a855f7',
          'purple-hover': '#9333ea',
          'purple-subtle': 'rgba(168, 85, 247, 0.1)',
        },
      }
    },
  },
  plugins: [],
}
