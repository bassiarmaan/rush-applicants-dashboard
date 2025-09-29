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
        primary: {
          50: '#f7f9f4',
          100: '#eef2e8',
          200: '#dde5d1',
          300: '#c5d4b0',
          400: '#a8c085',
          500: '#8ba85f',
          600: '#6b8e23',
          700: '#5a7a1e',
          800: '#4a6219',
          900: '#3d5116',
        },
      },
      fontFamily: {
        'mono': ['Courier Prime', 'monospace'],
        'sans': ['Courier Prime', 'monospace'],
      },
    },
  },
  plugins: [],
}
