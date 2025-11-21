/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'pace-red': '#B91C1C',
        'pace-red-light': '#DC2626',
        'pace-red-dark': '#991B1B',
        'pace-charcoal': '#2d2d2d',
        'pace-charcoal-light': '#3d3d3d',
        'railings': '#31363B',
        'railings-light': '#3f4449',
      },
    },
  },
  plugins: [],
}