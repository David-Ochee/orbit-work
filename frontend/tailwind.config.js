/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        stellar: {
          purple: '#7B2FBE',
          blue: '#0EA5E9',
        },
      },
    },
  },
  plugins: [],
};
