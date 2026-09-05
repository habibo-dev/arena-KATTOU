/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: '#1a237e',
        'navy-light': '#2d3a62',
        green: '#2e7d32',
        'green-light': '#4caf50',
        gray: '#f5f5f5',
        'gray-light': '#e0e0e0',
        'gray-medium': '#757575',
        white: '#ffffff',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}