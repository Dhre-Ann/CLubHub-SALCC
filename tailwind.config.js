/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["index.html", "./public/pages/**/*.{html,js}", "./public/auth/**/*.html"],
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

