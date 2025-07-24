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
      },
    },
  },
  plugins: [],
}