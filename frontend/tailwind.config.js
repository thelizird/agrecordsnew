/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brown: {
          800: '#3e2723',
          600: '#795548',
        },
        cream: {
          500: '#F4F3EF',
          600: '#ede8d1',
        },
        green: {
          500: '#9AC35E',  // New green color added
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
