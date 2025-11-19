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
        'clairient-blue': '#1e40af',
        'clairient-light': '#3b82f6',
        'clairient-dark': '#1e3a8a',
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