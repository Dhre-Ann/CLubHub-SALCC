/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/pages/**/*.{html,js}", "./public/auth/**/*.html", "index.html"],
  safelist: [
    'prev-date', 
    'next-date', 
    'today', 
    'event',
    'day',
    'active'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

